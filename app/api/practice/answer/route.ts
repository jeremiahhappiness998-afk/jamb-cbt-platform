import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

type ValidOption = 'A' | 'B' | 'C' | 'D';

function isValidOption(val: unknown): val is ValidOption {
  return val === 'A' || val === 'B' || val === 'C' || val === 'D';
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const data = typeof body === 'object' && body !== null ? body : {};

    const sessionId = 'sessionId' in data ? String(data.sessionId) : '';
    const questionId = 'questionId' in data ? String(data.questionId) : '';
    const selectedOption = 'selectedOption' in data ? data.selectedOption : null;

    if (!sessionId || !questionId || !isValidOption(selectedOption)) {
      return NextResponse.json(
        { error: 'Valid sessionId, questionId, and option (A, B, C, D) are required' },
        { status: 400 }
      );
    }

    // Ensure session belongs to authenticated user
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Practice session not found or access denied' },
        { status: 403 }
      );
    }

    // Fetch question to verify answer securely
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topic: { select: { id: true, name: true } },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const isCorrect = selectedOption === question.correctOption;

    // Check if question was already answered in this session
    const existingAnswer = await prisma.practiceAnswer.findFirst({
      where: {
        sessionId: session.id,
        questionId: question.id,
      },
    });

    if (existingAnswer) {
      await prisma.practiceAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOption,
          correct: isCorrect,
        },
      });
    } else {
      await prisma.practiceAnswer.create({
        data: {
          sessionId: session.id,
          questionId: question.id,
          selectedOption,
          correct: isCorrect,
        },
      });
    }

    // Update UserProgress for this user, subject, and topic
    const topicName = question.topic?.name || 'General';
    const userProgress = await prisma.userProgress.findFirst({
      where: {
        userId: user.id,
        subject: session.subject,
        topic: topicName,
      },
    });

    if (userProgress) {
      const isNewAnswer = !existingAnswer;
      const wasPreviouslyCorrect = existingAnswer?.correct === true;

      let correctIncrement = 0;
      if (isNewAnswer) {
        correctIncrement = isCorrect ? 1 : 0;
      } else if (!wasPreviouslyCorrect && isCorrect) {
        correctIncrement = 1;
      } else if (wasPreviouslyCorrect && !isCorrect) {
        correctIncrement = -1;
      }

      await prisma.userProgress.update({
        where: { id: userProgress.id },
        data: {
          attemptedCount: { increment: isNewAnswer ? 1 : 0 },
          correctCount: { increment: correctIncrement },
        },
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId: user.id,
          subject: session.subject,
          topic: topicName,
          attemptedCount: 1,
          correctCount: isCorrect ? 1 : 0,
        },
      });
    }

    // Return practice-specific immediate feedback including explanation
    return NextResponse.json({
      success: true,
      questionId: question.id,
      selectedOption,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Practice answer error:', error);
    return NextResponse.json(
      { error: 'Unable to evaluate answer' },
      { status: 500 }
    );
  }
}
