import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: params.id } });
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    result: {
      score: exam.score ?? 0,
      totalQuestions: exam.totalQuestions,
      percentage: exam.score ? Math.round((exam.score / exam.totalQuestions) * 100) : 0,
      status: exam.status,
    },
  });
}
