export function validateQuestion(question: any) {
  const errors: string[] = [];
  if (!question?.questionText || !String(question.questionText).trim()) {
    errors.push('Missing questionText');
  }
  if (!question?.options || !['A', 'B', 'C', 'D'].every((key) => typeof question.options[key] === 'string')) {
    errors.push('Invalid options object');
  }
  if (!['A', 'B', 'C', 'D'].includes(question?.correctAnswer)) {
    errors.push('Invalid correctAnswer');
  }
  if (!['easy', 'medium', 'hard'].includes(question?.difficulty ?? 'medium')) {
    errors.push('Invalid difficulty');
  }
  return errors;
}
