import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [examCount, completedAttempts, practiceCount] = await Promise.all([
      prisma.attempt.count({ where: { userId: user.id } }),
      prisma.attempt.findMany({
        where: { userId: user.id, submittedAt: { not: null } },
        select: {
          score: true,
          exam: { select: { totalQuestions: true } },
        },
      }),
      prisma.practiceSession.count({ where: { userId: user.id } }),
    ]);

    const totalQuestions = completedAttempts.reduce(
      (sum, att) => sum + (att.exam?.totalQuestions ?? 0),
      0
    );
    const totalCorrect = completedAttempts.reduce(
      (sum, att) => sum + (att.score ?? 0),
      0
    );
    const averageScore =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return NextResponse.json({
      success: true,
      user: userRecord,
      statistics: {
        examAttemptsCount: examCount,
        completedExamsCount: completedAttempts.length,
        practiceSessionsCount: practiceCount,
        totalQuestionsAnswered: totalQuestions,
        averageAccuracy: averageScore,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Unable to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const data = typeof body === 'object' && body !== null ? body : {};
    const name = 'name' in data ? String(data.name).trim() : '';

    if (!name || name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 60 characters' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Unable to update profile' },
      { status: 500 }
    );
  }
}
