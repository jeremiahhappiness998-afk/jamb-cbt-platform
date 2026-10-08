import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exam = await prisma.exam.findFirst({
    where: {
      id: params.id,
      userId: user.id,
      status: 'ACTIVE',
      attempts: { some: { userId: user.id } },
    },
    select: {
      id: true,
      title: true,
      totalQuestions: true,
      questions: {
        orderBy: { orderIndex: 'asc' },
        select: {
          orderIndex: true,
          question: {
            select: {
              id: true,
              questionText: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              questionType: true,
              imagePath: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: 'Active examination not found' }, { status: 404 });
  }

  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      totalQuestions: exam.totalQuestions,
      questions: exam.questions.map(({ orderIndex, question }) => ({
        id: question.id,
        sequence: orderIndex + 1,
        questionText: question.questionText,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD,
        },
        questionType: question.questionType,
        imagePath: question.imagePath,
      })),
    },
  });
}
