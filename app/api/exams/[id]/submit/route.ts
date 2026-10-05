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

  try {
    const body = await request.json();
    const questionId = String(body.questionId ?? '');
    const selectedOption = String(body.selectedOption ?? '');

    if (!questionId || !['A', 'B', 'C', 'D'].includes(selectedOption)) {
      return NextResponse.json({ error: 'Invalid answer payload' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const answer = await prisma.attemptAnswer.create({
      data: {
        attemptId: `exam:${exam.id}`,
        questionId: question.id,
        selectedOption,
        isCorrect: question.correctOption === selectedOption,
      },
    });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to save answer', details: String(error) }, { status: 500 });
  }
}
