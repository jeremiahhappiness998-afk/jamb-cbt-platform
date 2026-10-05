export function validateQuestion(question: any) {
  const errors: string[] = [];

  if (!question?.questionText || !String(question.questionText).trim()) {
    errors.push('Missing questionText');
  }

  if (!question?.options || !['A', 'B', 'C', 'D'].every((key) => typeof question.options[key] === 'string' && question.options[key].trim().length > 0)) {
    errors.push('Options object must contain non-empty A/B/C/D values');
  }

  if (!['A', 'B', 'C', 'D'].includes(question?.correctAnswer)) {
    errors.push('Invalid correctAnswer');
  }

  if (!['easy', 'medium', 'hard'].includes(question?.difficulty ?? 'medium')) {
    errors.push('Invalid difficulty');
  }

  if (!question?.subject || !String(question.subject).trim()) {
    errors.push('Missing subject');
  }

  if (!question?.topic || !String(question.topic).trim()) {
    errors.push('Missing topic');
  }

  return errors;
}
