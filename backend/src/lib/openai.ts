import OpenAI from 'openai';
import { SectionSchema } from './zod-schemas.js';
import type { z } from 'zod';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type GeneratedSection = z.infer<typeof SectionSchema>;

interface QuestionConfig {
  questionType: string;
  noOfQuestions: number;
  marksPerQuestion: number;
}

/**
 * Calls OpenAI to regenerate questions for a single section.
 * Runs synchronously (no queue) — suitable for targeted section refresh.
 */
export async function regenerateSingleSection(
  config: QuestionConfig,
  additionalInfo?: string,
): Promise<GeneratedSection> {
  const systemPrompt = `You are an expert educator. Return ONLY valid JSON for a single exam section matching this schema:
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
Do not include any text outside the JSON object.`;

  const userPrompt = [
    `Generate ${config.noOfQuestions} ${config.questionType} question(s), ${config.marksPerQuestion} mark(s) each.`,
    additionalInfo ? `Additional instructions: ${additionalInfo}` : null,
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
  return SectionSchema.parse(JSON.parse(raw));
}
