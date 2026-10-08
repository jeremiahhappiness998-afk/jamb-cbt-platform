import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const requestData = typeof body === 'object' && body !== null ? body : {};
    const countValue = 'count' in requestData ? Number(requestData.count) : 10;
    const subjectName = 'subject' in requestData ? String(requestData.subject) : 'Biology';

    if (!Number.isInteger(countValue) || countValue < 1 || !subjectName.trim()) {
      return NextResponse.json({ error: 'A subject and positive question count are required' }, { status: 400 });
    }

    const subject = await prisma.subject.findFirst({
      where: { name: subjectName, isActive: true },
    });
    if (!subject) {
      return NextResponse.json({ error: 'Selected subject not found' }, { status: 404 });
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
      },
    });

    if (questions.length < countValue) {
      return NextResponse.json({
        error: 'Not enough active questions available for the selected subject',
        available: questions.length,
        requested: countValue,
      }, { status: 400 });
    }

    const exam = await prisma.$transaction(async (transaction) => {
      const createdExam = await transaction.exam.create({
        data: {
          userId: user.id,
          title: `${subject.name} Exam`,
          status: 'ACTIVE',
          duration: 1500,
          totalQuestions: questions.length,
          questions: {
            create: questions.map((question, orderIndex) => ({
              orderIndex,
              question: { connect: { id: question.id } },
            })),
          },
        },
      });

      await transaction.attempt.create({
        data: {
          examId: createdExam.id,
          userId: user.id,
        },
      });

      return createdExam;
    });

    return NextResponse.json({
      success: true,
      examId: exam.id,
      subject: subject.name,
      totalQuestions: questions.length,
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
        imagePath: question.imagePath,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to start exam' }, { status: 500 });
  }
}
