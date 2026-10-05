import { questionFileSchema, QuestionImport } from './question-schema';

export function parseQuestionFile(raw: unknown) {
  const parsed = questionFileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }
  return { success: true as const, data: parsed.data };
}
