
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Subject = {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
};

const SUBJECT_ICONS: Record<string, string> = {
  "Use of English": "📘",
  Mathematics: "🔢",
  Physics: "⚛️",
  Chemistry: "🧪",
  Biology: "🧬",
};

const DEFAULT_ICON = "📖";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSubjectId = searchParams.get("subject") ?? "";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [untimed, setUntimed] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        const response = await fetch("/api/questions/subjects", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load available subjects.");
        }

        const data: { subjects: Subject[] } = await response.json();
        setSubjects(data.subjects);

        if (preselectedSubjectId) {
          const match = data.subjects.find(
            (s) => s.id === preselectedSubjectId
          );

          setSubject(match?.name ?? data.subjects[0]?.name ?? "");
        } else {
          setSubject(data.subjects[0]?.name ?? "");
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load available subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, [router, preselectedSubjectId]);

  async function startPractice() {
    if (starting) {
      return;
    }

    if (
      !subject ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 100 ||
      (!untimed &&
        (!Number.isInteger(durationMinutes) ||
          durationMinutes < 1 ||
          durationMinutes > 180))
    ) {
      setError(
        "Select a subject, enter 1–100 questions, and choose a valid duration."
      );
      return;
    }

    setStarting(true);
    setError("");

    try {
      const selectedDuration = untimed ? 0 : durationMinutes;

      const response = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count,
          subject,
          durationMinutes: selectedDuration,
        }),
      });

      const data: {
        sessionId?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !data.sessionId) {
        setError(
          data.error ??
            "Unable to start practice session. Please try again."
        );
        return;
      }

      // Correct URL: no spaces around the route or query parameter.
      const practiceUrl =
        `/practice/${encodeURIComponent(data.sessionId)}` +
        `?durationMinutes=${selectedDuration}`;

      router.push(practiceUrl);
    } catch (startError) {
      console.error("Start practice error:", startError);

      setError("Unable to start practice. Please check your connection.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Student workspace
            </p>

            <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
              Practice Questions
            </h1>
          </div>

          <nav
            aria-label="Main navigation"
            className="hidden gap-2 sm:flex"
          >
            <a
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              Dashboard
            </a>

            <a
              href="/simulation"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              CBT Exam
            </a>

            <a
              href="/results"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              Results
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        {/* Intro */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-green-400/10 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <span className="h-2 w-2 rounded-full bg-green-300" />
              PRACTICE SESSION
            </span>

            <h2 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">
              Sharpen your skills
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">
              Select a subject, choose your question count and set your
              preferred duration. Practise at your own pace, with or without
              a timer.
            </p>
          </div>
        </section>

        {/* Subject selection */}
        {!loadingSubjects && subjects.length > 0 && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold tracking-tight">
                Choose a subject
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the subject you want to practise today.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {subjects.map((s) => {
                const isSelected = s.name === subject;
                const icon = SUBJECT_ICONS[s.name] ?? DEFAULT_ICON;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.name)}
                    aria-pressed={isSelected}
                    className={[
                      "group rounded-2xl border p-5 text-left shadow-sm transition duration-200",
                      isSelected
                        ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={[
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition",
                          isSelected
                            ? "bg-emerald-100"
                            : "bg-emerald-50 group-hover:bg-emerald-100",
                        ].join(" ")}
                      >
                        {icon}
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-extrabold text-slate-900">
                      {s.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Practise {s.name} questions
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Loading subjects */}
        {loadingSubjects && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </section>
        )}

        {/* Session configuration */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-extrabold">
            Configure your session
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose your subject, question count and practice duration.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <label
                htmlFor="practice-subject"
                className="block text-sm font-semibold text-slate-800"
              >
                Subject
              </label>

              <select
                id="practice-subject"
                className="mt-2 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loadingSubjects || subjects.length === 0}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question count */}
            <div>
              <label
                htmlFor="practice-count"
                className="block text-sm font-semibold text-slate-800"
              >
                Number of questions
              </label>

              <input
                id="practice-count"
                type="number"
                min={1}
                max={100}
                step={1}
                value={count}
                onChange={(e) => {
                  setCount(Number(e.target.value));
                }}
                className="mt-2 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              />

              <p className="mt-1 text-xs text-slate-500">
                Choose between 1 and 100 questions.
              </p>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="practice-duration"
                className="block text-sm font-semibold text-slate-800"
              >
                Practice duration (minutes)
              </label>

              <input
                id="practice-duration"
                type="number"
                min={1}
                max={180}
                step={1}
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                }}
                disabled={untimed}
                className="mt-2 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />

              <p className="mt-1 text-xs text-slate-500">
                Set any whole number from 1 to 180 minutes.
              </p>

              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={untimed}
                  onChange={(e) => setUntimed(e.target.checked)}
                  className="h-4 w-4 accent-emerald-700"
                />

                Practise without a time limit
              </label>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startPractice}
              disabled={
                loadingSubjects ||
                starting ||
                !subject ||
                subjects.length === 0
              }
              className="btn btn-primary min-h-12 px-8 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSubjects
                ? "Loading subjects..."
                : starting
                  ? "Starting session..."
                  : "Start Practice →"}
            </button>

            <a
              href="/simulation"
              className="btn btn-secondary min-h-12 px-8"
            >
              Full CBT Exam instead
            </a>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Your answers and score are saved after you submit the session.
          </p>
        </section>

        {/* No subjects */}
        {!loadingSubjects && subjects.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
              📚
            </div>

            <h3 className="mt-4 text-lg font-bold">
              No subjects available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No active subjects are set up in the question bank yet.
            </p>
          </div>
        )}

        {/* Subject loading error */}
        {error && !starting && subjects.length === 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
              ⚠️
            </div>

            <h3 className="mt-4 text-lg font-bold text-red-900">
              Unable to load subjects
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Footer navigation */}
        <nav
          className="flex flex-wrap gap-3 border-t border-slate-200 pt-5"
          aria-label="Page navigation"
        >
          <a href="/dashboard" className="btn btn-secondary min-h-11">
            ← Back to Dashboard
          </a>

          <a href="/results" className="btn btn-secondary min-h-11">
            View Results
          </a>
        </nav>
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-600">
          Loading practice options...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
