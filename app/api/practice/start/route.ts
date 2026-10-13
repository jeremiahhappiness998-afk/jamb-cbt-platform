import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    include: {
      topics: {
        where: { isActive: true },
      },
    },
    orderBy: [{ name: 'asc' }],
  });

  return NextResponse.json({
    success: true,
    subjects: subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      topics: subject.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const requestData = typeof body === 'object' && body !== null ? body : {};
    const countValue = 'count' in requestData ? Number(requestData.count) : 20;
    const subjectQuery = 'subject' in requestData ? String(requestData.subject).trim() : '';
    const durationInput =
      'durationMinutes' in requestData
        ? Number(requestData.durationMinutes)
        : 15;

    if (
      !Number.isInteger(durationInput) ||
      durationInput < 0 ||
      durationInput > 180
    ) {
      return NextResponse.json(
        { error: 'Duration must be 0 (untimed) or a whole number from 1 to 180 minutes' },
        { status: 400 }
      );
    }

    const durationMinutes = durationInput;
    if (
      !subjectQuery ||
      !Number.isInteger(countValue) ||
      countValue < 1 ||
      countValue > 100
    ) {
      return NextResponse.json(
        { error: 'A valid subject and positive question count are required' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: subjectQuery },
          { id: subjectQuery },
        ],
        isActive: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Selected subject not found' },
        { status: 404 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { subjectId: subject.id, isActive: true },
      take: countValue,
      orderBy: [{ year: 'asc' }, { questionNumber: 'asc' }],
      select: {
        id: true,
        questionNumber: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        difficulty: true,
        questionType: true,
        imagePath: true,
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No active questions available for this subject' },
        { status: 400 }
      );
    }

    // Create a PracticeSession without touching official Exam or Attempt models
    const session = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        subject: subject.name,
        count: questions.length,
      },
    });

    // Strip correctOption and explanation to keep questions secure until answered
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      subject: subject.name,
      durationMinutes,
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
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
      })),
    });
  } catch (error) {
    console.error('Practice start error:', error);
    return NextResponse.json(
      { error: 'Unable to start practice session' },
      { status: 500 }
    );
  }
}
