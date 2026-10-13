import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exam = await prisma.exam.findFirst({
    where: { id: params.id, userId: user.id },
    select: {
      id: true,
      title: true,
      status: true,
      startedAt: true,
      endedAt: true,
      totalQuestions: true,
      score: true,
      questions: {
        orderBy: { orderIndex: 'asc' },
        select: {
          questionId: true,
          orderIndex: true,
          question: {
            select: {
              id: true,
              questionText: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              correctOption: true,
              explanation: true,
              questionType: true,
              imagePath: true,
            },
          },
        },
      },
      attempts: {
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { id: true, submittedAt: true, score: true },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: 'Examination not found.' }, { status: 404 });
  }

  const attempt = exam.attempts[0];
  const isSubmitted =
    exam.status === 'COMPLETED' ||
    exam.status === 'SUBMITTED' ||
    Boolean(attempt?.submittedAt);

  if (!isSubmitted || !attempt) {
    return NextResponse.json(
      { error: 'EXAM_NOT_SUBMITTED', message: 'This examination has not been submitted.' },
      { status: 409 },
    );
  }

  let answers = await prisma.attemptAnswer.findMany({
    where: { attemptId: attempt.id },
    select: { questionId: true, selectedOption: true, isCorrect: true },
  });

  if (answers.length === 0 && exam.status === 'SUBMITTED') {
    answers = await prisma.attemptAnswer.findMany({
      where: { attemptId: `exam:${exam.id}` },
      select: { questionId: true, selectedOption: true, isCorrect: true },
    });
  }

  const answersByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  const totalQuestions = exam.questions.length;
  const answeredCount = exam.questions.filter((item) => {
    const selectedOption = answersByQuestion.get(item.questionId)?.selectedOption;
    return selectedOption !== null && selectedOption !== undefined;
  }).length;
  const correctCount = exam.questions.filter((item) =>
    answersByQuestion.get(item.questionId)?.isCorrect === true,
  ).length;
  const incorrectCount = Math.max(answeredCount - correctCount, 0);
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const score = attempt.score ?? exam.score ?? correctCount;

  return NextResponse.json({
    result: {
      exam: {
        id: exam.id,
        title: exam.title,
        status: exam.status,
        startedAt: exam.startedAt.toISOString(),
        submittedAt: (attempt.submittedAt ?? exam.endedAt)?.toISOString() ?? null,
      },
      summary: {
        score,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
        correctCount,
        incorrectCount,
        unansweredCount,
      },
      questions: exam.questions.map((item) => {
        const answer = answersByQuestion.get(item.questionId);
        return {
          id: item.question.id,
          sequence: item.orderIndex + 1,
          questionText: item.question.questionText,
          options: {
            A: item.question.optionA,
            B: item.question.optionB,
            C: item.question.optionC,
            D: item.question.optionD,
          },
          selectedOption: answer?.selectedOption ?? null,
          correctOption: item.question.correctOption,
          isCorrect: answer?.selectedOption ? answer.isCorrect === true : null,
          explanation: item.question.explanation,
          questionType: item.question.questionType,
          imagePath: item.question.imagePath,
        };
      }),
    },
  });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;

  if (!userPayload || !userPayload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: params.id } });
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  if (exam.userId !== String(userPayload.sub)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (exam.status === 'SUBMITTED') {
    return NextResponse.json({ success: true, idempotent: true, examId: exam.id, status: exam.status });
  }

  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId: `exam:${exam.id}` },
    include: { question: true },
  });

  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = exam.totalQuestions || answers.length || 0;
  const wrong = answers.filter((answer) => answer.selectedOption && answer.isCorrect === false).length;
  const unanswered = Math.max(totalQuestions - answers.length, 0);
  const score = correctCount;

  const updated = await prisma.exam.update({
    where: { id: exam.id },
    data: {
      status: 'SUBMITTED',
      endedAt: new Date(),
      score,
    },
  });

  return NextResponse.json({
    success: true,
    examId: updated.id,
    status: updated.status,
    summary: {
      totalQuestions,
      correct: correctCount,
      wrong,
      unanswered,
      score,
      percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
    },
  });
}
