 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ExamResult = {
  percentage: number;
  correct: number;
  totalQuestions: number;
  wrong: number;
  unanswered: number;
  status: string;
};

export default function ResultsPage() {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadResult() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/exams/latest', {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (active) {
            setError(
              response.status === 401
                ? 'Please log in to view your examination results.'
                : 'We could not load your result. Please try again.',
            );
          }
          return;
        }

        const data = await response.json();

        if (active) {
          setResult(data.result || null);
        }
      } catch (err) {
        console.error('Unable to load result:', err);

        if (active) {
          setError('A connection error occurred. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-shell max-w-5xl">
        <div className="card p-8 text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
            role="status"
            aria-label="Loading results"
          />
          <p className="mt-4 text-slate-600">
            Loading your examination results...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell max-w-5xl">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load results
          </h1>
          <p className="mt-3 text-slate-600">{error}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="page-shell max-w-5xl">
        <div className="card p-8">
          <div className="text-4xl" aria-hidden="true">
            📝
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            No exam result available yet
          </h1>

          <p className="mt-2 text-slate-600">
            Complete an examination to see your performance report here.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const percentage = Number.isFinite(result.percentage)
    ? Math.min(100, Math.max(0, result.percentage))
    : 0;

  const total = Math.max(0, result.totalQuestions);
  const correct = Math.max(0, result.correct);
  const wrong = Math.max(0, result.wrong);
  const unanswered = Math.max(0, result.unanswered);

  const performanceLabel =
    percentage >= 80
      ? 'Excellent progress'
      : percentage >= 60
        ? 'Good progress'
        : percentage >= 40
          ? 'Keep building your skills'
          : 'More practice will help';

  const formattedPercentage = Number.isInteger(percentage)
    ? percentage
    : percentage.toFixed(1);

  return (
    <main className="page-shell mx-auto max-w-5xl space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-slate-900 px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
            JAMB CBT · Examination Report
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Your Result
          </h1>

          <p className="mt-2 text-slate-300">
            Review your performance and plan your next study session.
          </p>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Overall performance
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-6xl font-extrabold tracking-tight text-slate-900">
                {formattedPercentage}
              </span>
              <span className="text-3xl font-bold text-slate-500">%</span>
            </div>

            <p className="mt-3 text-lg font-semibold text-slate-800">
              {performanceLabel}
            </p>

            <div
              className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Exam percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {correct} correct out of {total} questions
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Answer breakdown
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">Correct</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {correct}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="text-slate-700">Wrong</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {wrong}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-slate-700">Unanswered</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {unanswered}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">
            Questions attempted
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {correct + wrong}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Questions with submitted answers
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">
            Completion status
          </p>
          <p className="mt-2 text-2xl font-bold capitalize text-slate-900">
            {result.status || 'Completed'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Status returned by your examination API
          </p>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          What next?
        </h2>

        <p className="mt-2 text-slate-600">
          Use this report to identify where you can improve. Practise
          challenging topics and take another mock examination when you
          are ready.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/practice"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Practise Questions
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print Result
          </button>
        </div>
      </section>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .page-shell {
            max-width: none !important;
            padding: 0 !important;
          }

          .card {
            break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}