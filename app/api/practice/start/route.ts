import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    include: {
      topics: {
        where: { isActive: true },
      },
    },
    orderBy: [{ name: 'asc' }],
  });

  return NextResponse.json({
    success: true,
    subjects: subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      topics: subject.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
      })),
    })),
  });
}
