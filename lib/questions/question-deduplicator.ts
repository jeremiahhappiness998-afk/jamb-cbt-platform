export function normalizeForDuplicateCheck(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function deduplicateQuestions(questions: any[]) {
  const seen = new Map<string, any>();
  const unique: any[] = [];

  for (const question of questions) {
    const key = `${normalizeForDuplicateCheck(question.subject || '')}|${question.year ?? ''}|${question.questionNumber ?? ''}|${normalizeForDuplicateCheck(question.questionText || '')}`;
    if (!seen.has(key)) {
      seen.set(key, question);
      unique.push(question);
    }
  }

  return unique;
}
