import type { QuestionImport } from './question-schema';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateQuestion(question: QuestionImport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!question?.questionText || !String(question.questionText).trim()) {
    errors.push({ field: 'questionText', message: 'Question text is required and cannot be empty' });
  }

  if (!question?.options || typeof question.options !== 'object') {
    errors.push({ field: 'options', message: 'Options must be an object' });
  } else {
    const requiredOptions: Array<keyof QuestionImport['options']> = ['A', 'B', 'C', 'D'];
    for (const key of requiredOptions) {
      if (!question.options[key] || !String(question.options[key]).trim()) {
        errors.push({ field: `options.${key}`, message: `Option ${key} is required and cannot be empty` });
      }
    }
  }

  if (!['A', 'B', 'C', 'D'].includes(question?.correctAnswer)) {
    errors.push({ field: 'correctAnswer', message: 'Correct answer must be one of A, B, C, or D' });
  }

  if (question?.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
    errors.push({ field: 'difficulty', message: 'Difficulty must be one of: easy, medium, hard' });
  }

  if (!question?.subject || !String(question.subject).trim()) {
    errors.push({ field: 'subject', message: 'Subject is required' });
  }

  if (!question?.topic || !String(question.topic).trim()) {
    errors.push({ field: 'topic', message: 'Topic is required' });
  }

  if (question?.year && !Number.isInteger(question.year)) {
    errors.push({ field: 'year', message: 'Year must be an integer' });
  }

  if (question?.questionNumber && !Number.isInteger(question.questionNumber)) {
    errors.push({ field: 'questionNumber', message: 'Question number must be an integer' });
  }

  return errors;
}
