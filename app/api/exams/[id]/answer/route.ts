import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const totalQuestions = Number(body.totalQuestions ?? 10);

  const questions = await prisma.question.findMany({
    where: { isActive: true },
    take: totalQuestions,
  });

  const exam = await prisma.exam.create({
    data: {
      userId: String(userPayload.sub),
      title: 'Real CBT Simulation',
      status: 'ACTIVE',
      duration: 1500,
      totalQuestions: questions.length,
      startedAt: new Date(),
      score: 0,
    },
  });

  for (const [index, question] of questions.entries()) {
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        questionId: question.id,
        orderIndex: index,
      },
    });
  }

  return NextResponse.json({ success: true, examId: exam.id, questions });
}
