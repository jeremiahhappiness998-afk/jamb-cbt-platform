import { cookies } from 'next/headers';
import { prisma } from './db';
import { verifyToken } from './auth';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) return null;

  const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
