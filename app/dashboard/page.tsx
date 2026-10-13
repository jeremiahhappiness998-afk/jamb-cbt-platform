import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

const PREFERRED_SUBJECT_ORDER = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];

const SUBJECT_METADATA: Record<
  string,
  { icon: string; description: string }
> = {
  "Use of English": {
    icon: "📘",
    description: "Comprehension passages, lexis and structure, and oral forms for UTME.",
  },
  Mathematics: {
    icon: "🔢",
    description: "Number and numeration, algebra, geometry, calculus, and statistics.",
  },
  Physics: {
    icon: "⚛️",
    description: "Mechanics, thermal physics, optics, waves, and fields.",
  },
  Chemistry: {
    icon: "🧪",
    description: "Physical, organic, inorganic chemistry, and stoichiometry.",
  },
  Biology: {
    icon: "🧬",
    description: "Cell biology, plant and animal physiology, genetics, and ecology.",
  },
};

const DEFAULT_SUBJECT_ICON = "📖";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "S"
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [
    subjects,
    questionCount,
    examCount,
    recentAttempts,
    completedAttempts,
    progress,
    recentPractice,
  ] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            questions: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.question.count({
      where: {
        isActive: true,
        subject: { isActive: true },
      },
    }),

    prisma.attempt.count({
      where: { userId: user.id },
    }),

    prisma.attempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: {
        id: true,
        examId: true,
        startedAt: true,
        submittedAt: true,
        score: true,
        exam: {
          select: {
            id: true,
            title: true,
            totalQuestions: true,
          },
        },
      },
    }),

    prisma.attempt.findMany({
      where: {
        userId: user.id,
        submittedAt: { not: null },
      },
      select: {
        score: true,
        exam: {
          select: {
            totalQuestions: true,
          },
        },
      },
    }),

    prisma.userProgress.aggregate({
      where: { userId: user.id },
      _sum: {
        correctCount: true,
        attemptedCount: true,
      },
    }),

    prisma.practiceSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 3,
      select: {
        id: true,
        subject: true,
        count: true,
        startedAt: true,
        completedAt: true,
      },
    }),
  ]);

  // Calculate real progress statistics based on actual stored examination and progress records
  const examQuestionsAttempted = completedAttempts.reduce(
    (sum, att) => sum + (att.exam?.totalQuestions ?? 0),
    0
  );
  const examQuestionsCorrect = completedAttempts.reduce(
    (sum, att) => sum + (att.score ?? 0),
    0
  );

  const totalAttempted =
    examQuestionsAttempted + (progress._sum.attemptedCount ?? 0);
  const totalCorrect =
    examQuestionsCorrect + (progress._sum.correctCount ?? 0);

  const accuracy =
    totalAttempted > 0
      ? Math.min(100, Math.round((totalCorrect / totalAttempted) * 100))
      : 0;

  const firstName = user.name.trim().split(/\s+/)[0] || "Student";

  // Sort subjects to highlight the 5 core JAMB subjects in standard order
  const sortedSubjects = [...subjects].sort((a, b) => {
    const indexA = PREFERRED_SUBJECT_ORDER.indexOf(a.name);
    const indexB = PREFERRED_SUBJECT_ORDER.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop sidebar - sticky on scroll */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-5 py-7 md:flex">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-extrabold text-white shadow-sm">
              J
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight">
                JAMB CBT
              </p>
              <p className="text-xs text-slate-500">
                Student portal
              </p>
            </div>
          </Link>

          <div className="mt-10">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Main menu
            </p>

            <nav className="space-y-1.5" aria-label="Sidebar navigation">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800"
              >
                <span className="text-lg" aria-hidden="true">▦</span>
                Dashboard
              </Link>

              <Link
                href="/simulation"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="text-lg" aria-hidden="true">▤</span>
                CBT Examination
              </Link>

              <Link
                href="/practice"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="text-lg" aria-hidden="true">✎</span>
                Practice
              </Link>

              <Link
                href="/results"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="text-lg" aria-hidden="true">◷</span>
                Results
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="text-lg" aria-hidden="true">👤</span>
                Profile
              </Link>
            </nav>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl bg-emerald-800 p-5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                🎯
              </div>

              <h3 className="mt-4 font-bold">
                Your goal matters
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-100">
                Build confidence through regular practice and realistic CBT
                examinations.
              </p>

              <Link
                href="/simulation"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                Take CBT Exam →
              </Link>
            </div>

            {/* Logout button */}
            <SignOutButton />
          </div>
        </aside>

        {/* Main dashboard */}
        <main className="min-w-0 flex-1">
          {/* Top navigation - sticky on scroll */}
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur-sm sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Student workspace
              </p>

              <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-slate-100"
                title="View your profile"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>

                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-700 font-bold text-white shadow-sm"
                  title={user.name}
                >
                  {getInitials(user.name)}
                </div>
              </Link>

              {/* Mobile logout */}
              <SignOutButton
                variant="mobile"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 md:hidden"
              />
            </div>
          </header>

          {/* Sticky mobile navigation strip */}
          <nav
            aria-label="Mobile navigation"
            className="sticky top-[81px] z-20 flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 shadow-xs md:hidden"
          >
            <Link
              href="/dashboard"
              className="shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"
            >
              Dashboard
            </Link>
            <Link
              href="/simulation"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              CBT Exam
            </Link>
            <Link
              href="/practice"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Practice
            </Link>
            <Link
              href="/results"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Results
            </Link>
            <Link
              href="/profile"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Profile
            </Link>
          </nav>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            {/* Welcome banner */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 p-6 text-white shadow-lg sm:p-9">
              <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
              <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-green-400/10 blur-2xl" />

              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                  <span className="h-2 w-2 rounded-full bg-green-300" />
                  YOUR JAMB PREPARATION
                </span>

                <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                  Welcome back,
                  <br />
                  {firstName}!
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">
                  Prepare with confidence for the Unified Tertiary Matriculation
                  Examination (UTME). Take realistic CBT exams, practice by subject,
                  and track your mastery.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/simulation"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                  >
                    Start CBT Exam
                    <span>→</span>
                  </Link>

                  <Link
                    href="/practice"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Practise Questions
                  </Link>
                </div>
              </div>
            </section>

            {/* Overview statistics */}
            <section aria-labelledby="overview-stats-heading">
              <div className="mb-5">
                <h2 id="overview-stats-heading" className="text-xl font-extrabold tracking-tight">
                  Your overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Real-time overview of your learning resources and activity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Available subjects"
                  value={subjects.length}
                  description="Core subjects active in your portal"
                  icon="📚"
                />

                <StatCard
                  label="Question bank"
                  value={questionCount.toLocaleString("en-NG")}
                  description="Active UTME questions available"
                  icon="📝"
                />

                <StatCard
                  label="Exam attempts"
                  value={examCount}
                  description={`${completedAttempts.length} completed examination${completedAttempts.length === 1 ? "" : "s"}`}
                  icon="🎯"
                />

                <StatCard
                  label="Preparation accuracy"
                  value={`${accuracy}%`}
                  description={`${totalCorrect} correct out of ${totalAttempted} tracked questions`}
                  icon="📈"
                />
              </div>
            </section>

            {/* Five JAMB subjects section */}
            <section aria-labelledby="subjects-heading">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="subjects-heading" className="text-xl font-extrabold tracking-tight">
                    JAMB Subjects
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Prepare and practise the five core UTME subjects.
                  </p>
                </div>

                <Link
                  href="/practice"
                  className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                >
                  View all practice →
                </Link>
              </div>

              {sortedSubjects.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedSubjects.map((subject) => {
                    const totalQuestions = subject._count.questions;
                    const meta =
                      SUBJECT_METADATA[subject.name] ?? {
                        icon: DEFAULT_SUBJECT_ICON,
                        description: `Strengthen your preparation with ${subject.name} questions.`,
                      };

                    return (
                      <article
                        key={subject.id}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-100">
                            {meta.icon}
                          </div>

                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                            {totalQuestions} questions
                          </span>
                        </div>

                        <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                          {subject.name}
                        </h3>

                        <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">
                          {meta.description}
                        </p>

                        <div className="mt-5 flex gap-2">
                          <Link
                            href={`/practice?subject=${encodeURIComponent(subject.id)}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
                          >
                            Practise
                            <span>→</span>
                          </Link>

                          <Link
                            href="/simulation"
                            className="flex items-center justify-center rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            title={`Take CBT Exam in ${subject.name}`}
                          >
                            Exam
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-300 bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                    📚
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    Your subjects will appear here
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Add active subjects to your database to make them
                    available on this dashboard.
                  </p>
                </div>
              )}
            </section>

            {/* Recent activity: Exam attempts & Practice */}
            <section className="grid gap-6 xl:grid-cols-2">
              {/* Recent CBT attempts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Recent exam attempts
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your latest CBT examination activity.
                    </p>
                  </div>

                  <Link
                    href="/results"
                    className="text-sm font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    All results →
                  </Link>
                </div>

                {recentAttempts.length > 0 ? (
                  <div className="mt-6 divide-y divide-slate-100">
                    {recentAttempts.map((attempt) => {
                      const scorePercent =
                        attempt.score !== null && attempt.exam.totalQuestions > 0
                          ? Math.round(
                              (attempt.score / attempt.exam.totalQuestions) * 100
                            )
                          : null;

                      return (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-800">
                              {attempt.exam.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(attempt.startedAt)}
                              {" · "}
                              {attempt.exam.totalQuestions} questions
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-extrabold text-slate-900">
                              {scorePercent !== null && attempt.submittedAt
                                ? `${scorePercent}%`
                                : "Pending"}
                            </p>

                            {attempt.submittedAt ? (
                              <Link
                                href={`/results/${attempt.examId}`}
                                className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                              >
                                View result →
                              </Link>
                            ) : (
                              <Link
                                href={`/simulation/${attempt.examId}`}
                                className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                Resume exam →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-emerald-50/70 p-6 text-center">
                    <div className="text-3xl">🎯</div>
                    <p className="mt-3 font-bold">
                      Your first exam is waiting
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Start a realistic CBT examination to begin building your
                      exam history.
                    </p>

                    <Link
                      href="/simulation"
                      className="mt-4 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      Start an examination
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent practice sessions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Recent practice
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your latest practice sessions.
                    </p>
                  </div>

                  <Link
                    href="/practice"
                    className="text-sm font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    Start practice →
                  </Link>
                </div>

                {recentPractice.length > 0 ? (
                  <div className="mt-6 divide-y divide-slate-100">
                    {recentPractice.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                          ✎
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">
                            {session.subject}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {session.count} questions
                            {" · "}
                            {formatDate(session.startedAt)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            session.completedAt
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {session.completedAt
                            ? "Completed"
                            : "In progress"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
                    <div className="text-3xl">📖</div>
                    <p className="mt-3 font-bold">
                      Ready to practise?
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Strengthen your weak areas with flexible subject practice.
                    </p>

                    <Link
                      href="/practice"
                      className="mt-4 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      Start practising
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Preparation progress */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold">
                    Your preparation progress
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Overall accuracy calculated from completed CBT examinations and recorded answers.
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                  <p className="text-2xl font-extrabold text-emerald-800">
                    {accuracy}%
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Accuracy
                  </p>
                </div>
              </div>

              <div
                className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Practice accuracy"
                aria-valuenow={accuracy}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-green-500 transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span>
                  {totalAttempted.toLocaleString("en-NG")} questions tracked
                </span>

                <span>
                  {totalCorrect.toLocaleString("en-NG")} correct answers
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                {totalAttempted === 0
                  ? "Your progress statistics will update automatically as you complete CBT examinations and submit your answers."
                  : "Keep practising consistently across all five subjects to maintain high accuracy and build speed."}
              </p>
            </section>

            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-400">
              <p>JAMB CBT Platform — Student Workspace</p>
              <div className="flex gap-4">
                <Link href="/practice" className="hover:text-slate-600">
                  Practice
                </Link>
                <Link href="/simulation" className="hover:text-slate-600">
                  CBT Exam
                </Link>
                <Link href="/results" className="hover:text-slate-600">
                  Results
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}