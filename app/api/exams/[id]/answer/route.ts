import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;

  if (!userPayload || !userPayload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestedCount = Number(body.count ?? body.totalQuestions ?? 10);
    const subjectFilter = body.subject ? String(body.subject) : undefined;
    const topicFilter = body.topic ? String(body.topic) : undefined;
    const yearFilter = body.year ? Number(body.year) : undefined;

    const where: any = { isActive: true };
    if (subjectFilter) {
      const subject = await prisma.subject.findFirst({ where: { name: subjectFilter } });
      if (!subject) {
        return NextResponse.json({ error: 'Selected subject not found' }, { status: 404 });
      }
      where.subjectId = subject.id;
    }
    if (topicFilter) {
      const topic = await prisma.topic.findFirst({ where: { name: topicFilter } });
      if (!topic) {
        return NextResponse.json({ error: 'Selected topic not found' }, { status: 404 });
      }
      where.topicId = topic.id;
    }
    if (yearFilter) {
      where.year = yearFilter;
    }

    const available = await prisma.question.count({ where });
    if (available < requestedCount) {
      return NextResponse.json({
        error: 'Not enough questions available for the requested selection.',
        available,
        requested: requestedCount,
      }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where,
      take: requestedCount,
      orderBy: [{ year: 'asc' }, { questionNumber: 'asc' }],
      include: { subject: true, topic: true },
    });

    const exam = await prisma.exam.create({
      data: {
        userId: String(userPayload.sub),
        title: subjectFilter ? `${subjectFilter} Practice Exam` : 'Real CBT Simulation',
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
          markedForReview: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      examId: exam.id,
      available,
      requested: questions.length,
      questions: questions.map((question) => ({
        id: question.id,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD,
        },
        difficulty: question.difficulty,
        questionType: question.questionType,
        subject: question.subject.name,
        topic: question.topic.name,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to start exam', details: String(error) }, { status: 500 });
  }
}
