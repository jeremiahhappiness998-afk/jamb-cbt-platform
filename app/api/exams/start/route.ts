import { NextRequest, NextResponse } from 'next/server';
import { importQuestionsFromJson } from '@/lib/questions/question-importer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = importQuestionsFromJson(body);
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid question file' }, { status: 400 });
  }
}
