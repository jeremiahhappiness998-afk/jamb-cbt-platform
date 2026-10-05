import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId: `exam:${exam.id}` },
    include: { question: true },
  });

  const correct = answers.filter((a) => a.isCorrect).length;
  const wrong = answers.filter((a) => a.selectedOption && a.isCorrect === false).length;
  const unanswered = Math.max((exam.totalQuestions || 0) - answers.length, 0);

  return NextResponse.json({
    success: true,
    result: {
      examId: exam.id,
      score: exam.score ?? 0,
      totalQuestions: exam.totalQuestions,
      correct,
      wrong,
      unanswered,
      percentage: exam.totalQuestions > 0 ? Math.round((correct / exam.totalQuestions) * 100) : 0,
      status: exam.status,
      startedAt: exam.startedAt,
      endedAt: exam.endedAt,
    },
  });
}
