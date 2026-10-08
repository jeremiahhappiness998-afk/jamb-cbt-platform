import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type SubmitAnswer = {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
};

type SubmitRequest = {
  answers: SubmitAnswer[];
};

function isValidOption(
  value: unknown,
): value is 'A' | 'B' | 'C' | 'D' {
  return (
    value === 'A' ||
    value === 'B' ||
    value === 'C' ||
    value === 'D'
  );
}

export async function POST(
  request: Request,
  context: {
    params: {
      id: string;
    };
  },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const examId = context.params.id;

    if (!examId) {
      return NextResponse.json(
        { error: 'Exam ID is required.' },
        { status: 400 },
      );
    }

    let body: SubmitRequest;

    try {
      body = (await request.json()) as SubmitRequest;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    if (!body || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Answers must be provided as an array.' },
        { status: 400 },
      );
    }

    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            question: {
              select: {
                id: true,
                correctOption: true,
              },
            },
          },
        },
        attempts: {
          orderBy: {
            startedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Examination not found.' },
        { status: 404 },
      );
    }

    if (exam.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'This examination has already been completed.',
        },
        { status: 409 },
      );
    }

    const attempt = exam.attempts[0];

    if (!attempt) {
      return NextResponse.json(
        {
          error: 'No active attempt was found for this examination.',
        },
        { status: 409 },
      );
    }

    if (attempt.submittedAt) {
      return NextResponse.json(
        {
          error: 'This attempt has already been submitted.',
        },
        { status: 409 },
      );
    }

    const allowedQuestionIds = new Set(
      exam.questions.map((examQuestion) => examQuestion.questionId),
    );

    const submittedAnswers = new Map<
      string,
      'A' | 'B' | 'C' | 'D' | null
    >();

    for (const answer of body.answers) {
      if (
        !answer ||
        typeof answer.questionId !== 'string' ||
        !allowedQuestionIds.has(answer.questionId)
      ) {
        continue;
      }

      const selectedOption =
        answer.selectedOption === null
          ? null
          : isValidOption(answer.selectedOption)
            ? answer.selectedOption
            : null;

      submittedAnswers.set(answer.questionId, selectedOption);
    }

    const results = exam.questions.map((examQuestion) => {
      const selectedOption =
        submittedAnswers.get(examQuestion.questionId) ?? null;

      const isCorrect =
        selectedOption !== null &&
        selectedOption === examQuestion.question.correctOption;

      return {
        questionId: examQuestion.questionId,
        selectedOption,
        isCorrect,
      };
    });

    const correctCount = results.filter(
      (result) => result.isCorrect,
    ).length;

    const answeredCount = results.filter(
      (result) => result.selectedOption !== null,
    ).length;

    const unansweredCount =
      exam.totalQuestions - answeredCount;

    const wrongCount = answeredCount - correctCount;

    const percentage =
      exam.totalQuestions > 0
        ? Math.round(
            (correctCount / exam.totalQuestions) * 100,
          )
        : 0;

    const submittedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.attemptAnswer.deleteMany({
        where: {
          attemptId: attempt.id,
        },
      });

      await tx.attemptAnswer.createMany({
        data: results.map((result) => ({
          attemptId: attempt.id,
          questionId: result.questionId,
          selectedOption: result.selectedOption,
          isCorrect: result.isCorrect,
        })),
      });

      await tx.attempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          submittedAt,
          score: correctCount,
        },
      });

      await tx.exam.update({
        where: {
          id: exam.id,
        },
        data: {
          status: 'COMPLETED',
          endedAt: submittedAt,
          score: correctCount,
        },
      });
    });

    return NextResponse.json({
      success: true,
      result: {
        examId: exam.id,
        attemptId: attempt.id,
        totalQuestions: exam.totalQuestions,
        answeredCount,
        unansweredCount,
        correctCount,
        wrongCount,
        percentage,
        submittedAt: submittedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Exam submission error:', error);

    return NextResponse.json(
      {
        error: 'Unable to submit examination.',
      },
      { status: 500 },
    );
  }
}