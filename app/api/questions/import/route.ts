import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { importQuestionsFromFile } from '@/lib/questions/question-importer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const result = importQuestionsFromFile(body);

    return NextResponse.json({
      success: true,
      summary: {
        total: result.total,
        valid: result.valid,
        duplicates: result.duplicates,
        failed: result.failed,
      },
      details: {
        validQuestions: result.validQuestions,
        failedQuestions: result.failedQuestions,
        duplicateQuestions: result.duplicateQuestions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Question import failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
