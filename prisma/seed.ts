import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jambprep.test' },
    update: {},
    create: {
      name: 'Development Admin',
      email: 'admin@jambprep.test',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@jambprep.test' },
    update: {},
    create: {
      name: 'Development Student',
      email: 'student@jambprep.test',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  const subjects = ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const biology = await prisma.subject.findUnique({ where: { name: 'Biology' } });
  if (biology) {
    const topic = await prisma.topic.upsert({
      where: { id: 'dev-biology-topic' },
      update: {},
      create: {
        id: 'dev-biology-topic',
        name: 'Cell Biology',
        subjectId: biology.id,
      },
    });

    await prisma.question.createMany({
      data: [
        {
          subjectId: biology.id,
          topicId: topic.id,
          year: 2024,
          questionNumber: 1,
          questionText: 'Development sample: Which organelle is responsible for energy production in a cell?',
          optionA: 'Ribosome',
          optionB: 'Mitochondrion',
          optionC: 'Nucleus',
          optionD: 'Golgi apparatus',
          correctOption: 'B',
          explanation: 'The mitochondrion produces ATP, which provides usable energy for cellular processes.',
          difficulty: 'medium',
          questionType: 'TEXT',
          source: 'Development Sample',
          isActive: true,
        },
      ],
    });
  }

  console.log('Seeded admin, student, and sample subject data');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
