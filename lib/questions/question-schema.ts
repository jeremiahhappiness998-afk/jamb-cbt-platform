import { z } from 'zod';

export const answerOptionSchema = z.enum(['A', 'B', 'C', 'D']);
export const questionTypeSchema = z.enum(['TEXT', 'IMAGE', 'TEXT_WITH_IMAGE']);
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const questionImportSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().optional(),
  year: z.number().int(),
  questionNumber: z.number().int(),
  questionText: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  correctAnswer: answerOptionSchema,
  explanation: z.string().optional(),
  difficulty: difficultySchema.default('medium'),
  questionType: questionTypeSchema.default('TEXT'),
  source: z.string().optional(),
  isActive: z.boolean().default(true),
  image: z.object({
    path: z.string(),
    alt: z.string().optional(),
  }).optional(),
});

export const questionFileSchema = z.object({
  version: z.string().optional(),
  subject: z.string().min(1),
  year: z.number().int(),
  questions: z.array(questionImportSchema),
});

export type QuestionImport = z.infer<typeof questionImportSchema>;
export type QuestionFile = z.infer<typeof questionFileSchema>;
