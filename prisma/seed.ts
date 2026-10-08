import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { importQuestionsFromFile } from '../lib/questions/question-importer';
import { parseQuestionFile } from '../lib/questions/question-parser';

const prisma = new PrismaClient();

async function main() {
  const root = path.resolve(process.cwd(), 'question-bank');
  const report = {
    filesDiscovered: 0,
    validFiles: 0,
    invalidFiles: 0,
    questionsDiscovered: 0,
    questionsImported: 0,
    duplicates: 0,
    failures: 0,
    subjects: new Set<string>(),
    years: new Set<number>(),
  };

  const subjectDirectories = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const directoryName of subjectDirectories) {
    const directory = path.join(root, directoryName);
    const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();

    for (const fileName of files) {
      const filePath = path.join(directory, fileName);
      report.filesDiscovered += 1;

      let raw: unknown;
      try {
        raw = JSON.parse(await readFile(filePath, 'utf8'));
      } catch (error) {
        report.invalidFiles += 1;
        report.failures += 1;
        console.error(`${path.relative(process.cwd(), filePath)}: invalid JSON: ${String(error)}`);
        continue;
      }

      const parsedFile = parseQuestionFile(raw);
      if (!parsedFile.success) {
        report.invalidFiles += 1;
        report.failures += parsedFile.errors.length;
        console.error(`${path.relative(process.cwd(), filePath)}: invalid question-bank file`);
        for (const error of parsedFile.errors) {
          console.error(`  ${error.path}: ${error.message}`);
        }
        continue;
      }

      report.validFiles += 1;
      report.questionsDiscovered += parsedFile.data.questions.length;
      report.subjects.add(parsedFile.data.subject);
      report.years.add(parsedFile.data.year);

      const imported = importQuestionsFromFile(raw);
      report.duplicates += imported.duplicates;
      report.failures += imported.failed;

      for (const failed of imported.failedQuestions) {
        for (const error of failed.errors) {
          console.error(
            `${path.relative(process.cwd(), filePath)} question ${failed.questionNumber ?? 'unknown'}: ${error.field}: ${error.message}`
          );
        }
      }

      const subject = await prisma.subject.upsert({
        where: { name: parsedFile.data.subject },
        update: {},
        create: { name: parsedFile.data.subject },
      });

      for (const question of imported.validQuestions) {
        let topic = await prisma.topic.findFirst({
          where: { name: question.topic, subjectId: subject.id },
        });
        if (!topic) {
          topic = await prisma.topic.create({
            data: { name: question.topic, subjectId: subject.id },
          });
        }

        let subtopicId: string | null = null;
        if (question.subtopic) {
          let subtopic = await prisma.subtopic.findFirst({
            where: { name: question.subtopic, topicId: topic.id },
          });
          if (!subtopic) {
            subtopic = await prisma.subtopic.create({
              data: { name: question.subtopic, topicId: topic.id },
            });
          }
          subtopicId = subtopic.id;
        }

        const questionData = {
          subjectId: subject.id,
          topicId: topic.id,
          subtopicId,
          year: question.year,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          optionA: question.options.A,
          optionB: question.options.B,
          optionC: question.options.C,
          optionD: question.options.D,
          correctOption: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          questionType: question.questionType,
          imagePath: question.image?.path,
          source: question.source,
          isActive: question.isActive,
        };

        const existing = await prisma.question.findFirst({
          where: {
            subjectId: subject.id,
            year: question.year,
            questionNumber: question.questionNumber,
            questionText: question.questionText,
          },
        });

        if (existing) {
          await prisma.question.update({
            where: { id: existing.id },
            data: questionData,
          });
          report.duplicates += 1;
        } else {
          await prisma.question.create({ data: questionData });
          report.questionsImported += 1;
        }
      }
    }
  }

  const [subjectCount, questionCount] = await Promise.all([
    prisma.subject.count(),
    prisma.question.count(),
  ]);

  console.log('Question bank import report');
  console.log(`Files discovered: ${report.filesDiscovered}`);
  console.log(`Valid files: ${report.validFiles}`);
  console.log(`Invalid files: ${report.invalidFiles}`);
  console.log(`Questions discovered: ${report.questionsDiscovered}`);
  console.log(`Questions imported: ${report.questionsImported}`);
  console.log(`Duplicates (source and already present): ${report.duplicates}`);
  console.log(`Failures: ${report.failures}`);
  console.log(`Subjects: ${[...report.subjects].sort().join(', ') || 'none'}`);
  console.log(`Years: ${[...report.years].sort((left, right) => left - right).join(', ') || 'none'}`);
  console.log(`SQLite totals: ${subjectCount} subjects, ${questionCount} questions`);

  if (report.invalidFiles > 0 || report.failures > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Question bank import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
