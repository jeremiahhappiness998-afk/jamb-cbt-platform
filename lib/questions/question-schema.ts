import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseQuestionFile, normalizeQuestion } from '@/lib/questions/question-parser';
import { validateQuestion } from '@/lib/questions/question-validator';
import { deduplicateQuestions } from '@/lib/questions/question-deduplicator';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;

  if (!userPayload || !userPayload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: String(userPayload.sub) } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
  }

  try {
    const raw = await request.json();
    const parsed = parseQuestionFile(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid question file', details: parsed.errors }, { status: 400 });
    }

    const validQuestions = [] as any[];
    const failedQuestions = [] as any[];

    for (const question of parsed.data.questions) {
      const errors = validateQuestion(question);
      if (errors.length > 0) {
        failedQuestions.push({ question, errors });
        continue;
      }
      validQuestions.push(normalizeQuestion(question));
    }

    const deduplicated = deduplicateQuestions(validQuestions);

    return NextResponse.json({
      success: true,
      summary: {
        total: parsed.data.questions.length,
        valid: deduplicated.length,
        duplicates: validQuestions.length - deduplicated.length,
        failed: failedQuestions.length,
      },
      duplicates: validQuestions.filter((question) => !deduplicated.some((item) => JSON.stringify(item) === JSON.stringify(question))),
      failed: failedQuestions,
      valid: deduplicated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Question import failed', details: String(error) }, { status: 500 });
  }
}
