import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const valid = token ? await verifyToken(token) : null;
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await prisma.subject.findMany({
    include: { topics: true },
  });

  return NextResponse.json({ success: true, subjects: result });
}
