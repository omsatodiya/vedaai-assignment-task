import { z } from 'zod';

const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string().nullish(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number(),
});

const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string().optional(),
  questions: z.array(QuestionSchema),
});

export const QuestionPaperSchema = z.object({
  sections: z.array(SectionSchema),
});

export type QuestionPaperOutput = z.infer<typeof QuestionPaperSchema>;
