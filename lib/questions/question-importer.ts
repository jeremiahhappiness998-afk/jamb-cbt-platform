import { normalizeQuestion } from './question-parser';
import { deduplicateQuestions } from './question-deduplicator';
import { validateQuestion } from './question-validator';

export function importQuestionsFromJson(raw: unknown) {
  const questions = Array.isArray((raw as any)?.questions) ? (raw as any).questions : [];
  const valid: any[] = [];
  const duplicates: any[] = [];
  const failed: any[] = [];

  for (const question of questions) {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      failed.push({ question, errors });
      continue;
    }
    const normalized = normalizeQuestion(question);
    valid.push(normalized);
  }

  const deduped = deduplicateQuestions(valid);
  for (const item of valid) {
    const key = `${(item.subject || '').toLowerCase()}|${item.year ?? ''}|${item.questionNumber ?? ''}|${(item.questionText || '').toLowerCase()}`;
    if (!deduped.some((candidate) => `${(candidate.subject || '').toLowerCase()}|${candidate.year ?? ''}|${candidate.questionNumber ?? ''}|${(candidate.questionText || '').toLowerCase()}` === key)) {
      duplicates.push(item);
    }
  }

  return {
    total: questions.length,
    valid: deduped.length,
    duplicates: duplicates.length,
    failed: failed.length,
    results: deduped,
    errors: failed,
  };
}
