import { z } from 'zod';

export const answerOptionSchema = z.enum(['A', 'B', 'C', 'D']);
export const questionTypeSchema = z.enum(['TEXT', 'IMAGE', 'TEXT_WITH_IMAGE']);
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const questionImportSchema = z.object({
  id: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional(),
  questionNumber: z.number().int('Question number must be an integer'),
  questionText: z.string().min(1, 'Question text is required'),
  options: z.object({
    A: z.string().min(1, 'Option A is required'),
    B: z.string().min(1, 'Option B is required'),
    C: z.string().min(1, 'Option C is required'),
    D: z.string().min(1, 'Option D is required'),
  }),
  correctAnswer: answerOptionSchema,
  explanation: z.string().optional(),
  difficulty: difficultySchema.default('medium'),
  questionType: questionTypeSchema.default('TEXT'),
  source: z.string().optional(),
  isActive: z.boolean().default(true),
  image: z
    .object({
      path: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
});

export const questionFileSchema = z.object({
  version: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  year: z.number().int('Year must be an integer'),
  questions: z.array(questionImportSchema).min(1, 'At least one question is required'),
});

export type QuestionBankRecord = z.infer<typeof questionImportSchema>;
export type QuestionFile = z.infer<typeof questionFileSchema>;
export type QuestionImport = QuestionBankRecord & Pick<QuestionFile, 'subject' | 'year'>;
