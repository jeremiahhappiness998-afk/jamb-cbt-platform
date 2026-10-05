import { QuestionImport, questionFileSchema } from './question-schema';

export function parseQuestionFile(raw: unknown) {
  const parsed = questionFileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.issues.map((issue) => issue.message) };
  }
  return { success: true as const, data: parsed.data };
}

export function normalizeQuestion(question: QuestionImport): QuestionImport {
  const normalized: QuestionImport = {
    ...question,
    subject: question.subject.trim(),
    topic: question.topic.trim(),
    subtopic: question.subtopic?.trim(),
    questionText: question.questionText.trim().replace(/\s+/g, ' '),
    explanation: question.explanation?.trim(),
    difficulty: question.difficulty ?? 'medium',
    questionType: question.questionType ?? 'TEXT',
    source: question.source ?? 'Question Bank',
    isActive: question.isActive ?? true,
  };

  return normalized;
}
