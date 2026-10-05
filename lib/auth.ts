import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;

  if (!userPayload || !userPayload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exam = await prisma.exam.findFirst({
    where: { userId: String(userPayload.sub) },
    orderBy: { createdAt: 'desc' },
  });

  if (!exam) {
    return NextResponse.json({ error: 'No exam found' }, { status: 404 });
  }

  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId: `exam:${exam.id}` },
  });

  const correct = answers.filter((answer) => answer.isCorrect).length;
  const wrong = answers.filter((answer) => answer.selectedOption && answer.isCorrect === false).length;
  const unanswered = Math.max((exam.totalQuestions || 0) - answers.length, 0);

  return NextResponse.json({
    success: true,
    result: {
      examId: exam.id,
      totalQuestions: exam.totalQuestions,
      correct,
      wrong,
      unanswered,
      percentage: exam.totalQuestions > 0 ? Math.round((correct / exam.totalQuestions) * 100) : 0,
      status: exam.status,
    },
  });
}
