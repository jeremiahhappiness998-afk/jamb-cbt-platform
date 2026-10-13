import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = await prisma.practiceSession.findUnique({
      where: { id: params.id },
      include: { answers: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Practice session not found or access denied' },
        { status: 404 }
      );
    }

    const completedAt = session.completedAt ?? new Date();

    if (!session.completedAt) {
      await prisma.practiceSession.update({
        where: { id: session.id },
        data: { completedAt },
      });
    }

    const totalQuestions = session.count;
    const answeredCount = session.answers.length;
    const correctCount = session.answers.filter((a) => a.correct === true).length;
    const wrongCount = answeredCount - correctCount;
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);
    const percentage =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return NextResponse.json({
      success: true,
      summary: {
        sessionId: session.id,
        subject: session.subject,
        totalQuestions,
        answeredCount,
        unansweredCount,
        correctCount,
        wrongCount,
        percentage,
        completedAt: completedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Practice complete error:', error);
    return NextResponse.json(
      { error: 'Unable to complete practice session' },
      { status: 500 }
    );
  }
}
