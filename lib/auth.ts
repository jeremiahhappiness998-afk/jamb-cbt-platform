import { normalizeQuestion } from './question-parser';
import { validateQuestion } from './question-validator';
import { deduplicateQuestions } from './question-deduplicator';

export type QuestionFileRecord = {
  subject: string;
  topic: string;
  subtopic?: string;
  year: number;
  questionNumber: number;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'TEXT' | 'IMAGE' | 'TEXT_WITH_IMAGE';
  source?: string;
  isActive?: boolean;
};

export function importQuestionsFromJson(raw: unknown) {
  const rawObject = raw as any;
  const questions = Array.isArray(rawObject?.questions) ? rawObject.questions : [];

  const valid: any[] = [];
  const failed: any[] = [];

  for (const question of questions) {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      failed.push({ question, errors });
      continue;
    }
    valid.push(normalizeQuestion(question));
  }

  const deduped = deduplicateQuestions(valid);

  return {
    total: questions.length,
    valid: deduped.length,
    duplicates: valid.length - deduped.length,
    failed: failed.length,
    results: deduped,
    errors: failed,
  };
}
