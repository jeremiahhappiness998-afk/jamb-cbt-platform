import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
