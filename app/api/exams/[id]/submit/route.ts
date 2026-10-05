import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const selectedOption = String(body.selectedOption ?? '');
  const questionId = String(body.questionId ?? '');

  await prisma.attemptAnswer.create({
    data: {
      attemptId: 'draft',
      questionId,
      selectedOption,
      isCorrect: null,
    },
  });

  return NextResponse.json({ success: true, saved: true });
}
