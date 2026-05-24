import { Worker } from 'bullmq';
import redis from '../lib/redis.js';
import { openai } from '../lib/openai.js';
import { QuestionPaperSchema } from '../lib/zod-schemas.js';
import { getIO } from '../lib/socket.js';
import { Assignment } from '../models/Assignment.model.js';
import type { IAssignment } from '../models/Assignment.model.js';

type AssignmentStatus = IAssignment['status'];

function emit(assignmentId: string, status: AssignmentStatus, progress: number, statusText: string) {
  try {
    getIO().emit(`progress:assignment_${assignmentId}`, { status, progress, statusText });
  } catch {
    // socket not initialised yet (worker started before server) — ignore
  }
}

export const generationWorker = new Worker(
  'assignment-generation',
  async (job) => {
    const { assignmentId } = job.data as { assignmentId: string };

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    // ── Generating ──
    assignment.status = 'generating';
    await assignment.save();
    emit(assignmentId, 'generating', 10, 'Generating questions with AI…');

    const configSummary = assignment.questionConfigs
      .map((c) => `${c.noOfQuestions} × ${c.questionType} (${c.marksPerQuestion} marks each)`)
      .join(', ');

    const systemPrompt = `You are an expert educator. Return ONLY valid JSON matching this schema:
{
  "sections": [
    {
      "title": string,
      "instruction": string (optional),
      "questions": [
        {
          "question": string,
          "options": string[] (only for MCQ),
          "answer": string (optional),
          "difficulty": "easy" | "medium" | "hard",
          "marks": number
        }
      ]
    }
  ]
}
Group questions into sections by type. Do not include any text outside the JSON object.`;

    const userPrompt = [
      `Assignment title: ${assignment.title}`,
      `Question configurations: ${configSummary}`,
      assignment.dueDate ? `Due date: ${assignment.dueDate.toISOString()}` : null,
      assignment.additionalInfo ? `Additional instructions: ${assignment.additionalInfo}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    // ── Formatting ──
    assignment.status = 'formatting';
    await assignment.save();
    emit(assignmentId, 'formatting', 80, 'Formatting and validating…');

    const parsed = QuestionPaperSchema.parse(JSON.parse(raw));

    assignment.generatedPaper = {
      sections: parsed.sections.map((s) => ({
        title: s.title,
        ...(s.instruction !== undefined ? { instruction: s.instruction } : {}),
        questions: s.questions.map((q) => ({
          question: q.question,
          difficulty: q.difficulty,
          marks: q.marks,
          ...(q.options !== undefined ? { options: q.options } : {}),
          ...(q.answer != null ? { answer: q.answer } : {}),
        })),
      })),
    };
    assignment.status = 'completed';
    await assignment.save();
    emit(assignmentId, 'completed', 100, 'Done!');
  },
  { connection: redis },
);

generationWorker.on('failed', async (job, err) => {
  if (!job) return;
  const { assignmentId } = job.data as { assignmentId: string };
  await Assignment.findByIdAndUpdate(assignmentId, {
    status: 'failed',
    errorDetails: err instanceof Error ? err.message : String(err),
  });
  emit(assignmentId, 'failed', 0, 'Generation failed');
});
