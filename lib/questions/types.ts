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

export type ImportSummary = {
  total: number;
  valid: number;
  duplicates: number;
  failed: number;
  results: QuestionFileRecord[];
  errors: Array<{ question: any; errors: string[] }>;
};
