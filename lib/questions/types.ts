import type { QuestionBankRecord, QuestionImport, QuestionFile } from './question-schema';

export type QuestionFileRecord = {
  id?: string;
  topic: string;
  subtopic?: string;
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

export type QuestionBankFile = Pick<QuestionFile, 'version' | 'subject' | 'year'> & {
  questions: QuestionBankRecord[];
};

export type ImportSummary = {
  total: number;
  valid: number;
  duplicates: number;
  failed: number;
  results: QuestionImport[];
  errors: Array<{ question: QuestionFileRecord; errors: string[] }>;
};
