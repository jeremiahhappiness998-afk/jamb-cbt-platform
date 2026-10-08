import { parseQuestionFile } from './question-parser';
import { validateQuestion, ValidationError } from './question-validator';
import { normalizeQuestion } from './question-normalizer';
import { deduplicateQuestions } from './question-deduplicator';
import type { QuestionImport } from './question-schema';

export interface ImportResult {
  total: number;
  valid: number;
  duplicates: number;
  failed: number;
  validQuestions: QuestionImport[];
  failedQuestions: Array<{
    questionNumber?: number;
    errors: ValidationError[];
  }>;
  duplicateQuestions: QuestionImport[];
}

export function importQuestionsFromFile(raw: unknown): ImportResult {
  const parseResult = parseQuestionFile(raw);

  if (!parseResult.success) {
    return {
      total: 0,
      valid: 0,
      duplicates: 0,
      failed: 0,
      validQuestions: [],
      failedQuestions: [{ errors: parseResult.errors.map((e) => ({ field: e.path, message: e.message })) }],
      duplicateQuestions: [],
    };
  }

  const validQuestions: QuestionImport[] = [];
  const failedQuestions: Array<{ questionNumber?: number; errors: ValidationError[] }> = [];

  for (const question of parseResult.data.questions) {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      failedQuestions.push({
        questionNumber: question.questionNumber,
        errors,
      });
      continue;
    }
    validQuestions.push(normalizeQuestion(question));
  }

  const deduplicated = deduplicateQuestions(validQuestions);
  const duplicateCount = validQuestions.length - deduplicated.length;
  const duplicateQuestions = validQuestions.filter(
    (q) => !deduplicated.some((d) => keyToString(d) === keyToString(q))
  );

  return {
    total: parseResult.data.questions.length,
    valid: deduplicated.length,
    duplicates: duplicateCount,
    failed: failedQuestions.length,
    validQuestions: deduplicated,
    failedQuestions,
    duplicateQuestions,
  };
}

function keyToString(question: QuestionImport): string {
  const subject = (question.subject || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const text = (question.questionText || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return `${subject}|${question.year ?? 0}|${question.questionNumber ?? 0}|${text}`;
}
