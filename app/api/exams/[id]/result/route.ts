import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
