import type { Request, Response } from 'express';
import { Assignment } from '../models/Assignment.model.js';
import { assignmentQueue } from '../lib/queue.js';

export async function getAssignments(_req: Request, res: Response): Promise<void> {
  const assignments = await Assignment.find().sort({ createdAt: -1 });
  res.json(assignments);
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await Assignment.findById(req.params['id']);
  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }
  res.json(assignment);
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const { title, questionConfigs: rawConfigs, dueDate, additionalInfo } = req.body as {
    title?: string;
    questionConfigs?: string;
    dueDate?: string;
    additionalInfo?: string;
  };

  if (!title?.trim()) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  let questionConfigs: Array<{ questionType: string; noOfQuestions: number; marksPerQuestion: number }>;
  try {
    questionConfigs = rawConfigs ? (JSON.parse(rawConfigs) as typeof questionConfigs) : [];
  } catch {
    res.status(400).json({ message: 'Invalid questionConfigs JSON' });
    return;
  }

  if (!questionConfigs.length) {
    res.status(400).json({ message: 'At least one question configuration is required' });
    return;
  }

  const totalQuestions = questionConfigs.reduce((s, c) => s + c.noOfQuestions, 0);
  const totalMarks = questionConfigs.reduce((s, c) => s + c.noOfQuestions * c.marksPerQuestion, 0);

  const file = req.file as Express.Multer.File | undefined;

  const assignment = await Assignment.create({
    title: title.trim(),
    questionConfigs,
    totalQuestions,
    totalMarks,
    ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    ...(additionalInfo?.trim() ? { additionalInfo: additionalInfo.trim() } : {}),
    ...(file
      ? {
          uploadedFile: {
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
          },
        }
      : {}),
    status: 'queued',
  });

  await assignmentQueue.add('generate', { assignmentId: assignment._id.toString() });

  res.status(201).json(assignment);
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await Assignment.findByIdAndDelete(req.params['id']);
  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }
  res.status(204).send();
}

export async function regenerateAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await Assignment.findById(req.params['id']);
  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  // Reset to queued state and wipe the previous paper
  assignment.status = 'queued';
  assignment.generatedPaper = undefined;
  assignment.errorDetails = undefined;
  await assignment.save();

  // Re-enqueue the same job — worker picks up assignmentId and regenerates
  await assignmentQueue.add('generate', { assignmentId: assignment._id.toString() });

  res.status(202).json(assignment);
}
