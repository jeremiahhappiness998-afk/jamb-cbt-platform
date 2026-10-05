import { QuestionImport } from './question-schema';

export function normalizeQuestion(question: QuestionImport): QuestionImport {
  return {
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
    options: {
      A: question.options.A.trim(),
      B: question.options.B.trim(),
      C: question.options.C.trim(),
      D: question.options.D.trim(),
    },
  };
}
