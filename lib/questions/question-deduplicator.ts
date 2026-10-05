export interface DuplicateKey {
  subject: string;
  year: number;
  questionNumber: number;
  questionTextNormalized: string;
}

function normalizeForDuplicateCheck(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getDuplicateKey(question: any): DuplicateKey {
  return {
    subject: normalizeForDuplicateCheck(question.subject || ''),
    year: question.year ?? 0,
    questionNumber: question.questionNumber ?? 0,
    questionTextNormalized: normalizeForDuplicateCheck(question.questionText || ''),
  };
}

function keyToString(key: DuplicateKey): string {
  return `${key.subject}|${key.year}|${key.questionNumber}|${key.questionTextNormalized}`;
}

export function deduplicateQuestions(questions: any[]) {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const question of questions) {
    const key = getDuplicateKey(question);
    const keyStr = keyToString(key);

    if (!seen.has(keyStr)) {
      seen.add(keyStr);
      unique.push(question);
    }
  }

  return unique;
}
