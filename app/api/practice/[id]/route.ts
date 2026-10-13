import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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
      include: {
        answers: true,
      },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Practice session not found or access denied' },
        { status: 404 }
      );
    }

    const subject = await prisma.subject.findFirst({
      where: { name: session.subject, isActive: true },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { subjectId: subject.id, isActive: true },
      take: session.count,
      orderBy: [{ year: 'asc' }, { questionNumber: 'asc' }],
      select: {
        id: true,
        questionNumber: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correctOption: true,
        explanation: true,
        difficulty: true,
        questionType: true,
        imagePath: true,
        topic: { select: { id: true, name: true } },
      },
    });

    const answersMap = new Map(session.answers.map((a) => [a.questionId, a]));

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        subject: session.subject,
        count: session.count,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      questions: questions.map((q) => {
        const answer = answersMap.get(q.id);
        const isAnswered = Boolean(answer);

        return {
          id: q.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          options: {
            A: q.optionA,
            B: q.optionB,
            C: q.optionC,
            D: q.optionD,
          },
          difficulty: q.difficulty,
          questionType: q.questionType,
          imagePath: q.imagePath,
          topic: q.topic?.name ?? null,
          selectedOption: answer?.selectedOption ?? null,
          isCorrect: answer ? answer.correct : null,
          // Only reveal correctOption and explanation if already answered
          correctOption: isAnswered ? q.correctOption : null,
          explanation: isAnswered ? q.explanation : null,
        };
      }),
    });
  } catch (error) {
    console.error('Get practice session error:', error);
    return NextResponse.json(
      { error: 'Unable to load practice session' },
      { status: 500 }
    );
  }
}
