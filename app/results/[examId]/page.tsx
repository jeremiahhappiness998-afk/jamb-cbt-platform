'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ResultQuestion = {
  id: string;
  sequence: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean | null;
  explanation: string | null;
  questionType: string;
  imagePath: string | null;
};

type ExamResult = {
  exam: {
    id: string;
    title: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
  };
  summary: {
    score: number;
    totalQuestions: number;
    percentage: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
  };
  questions: ResultQuestion[];
};

type PageState =
  | { status: 'loading' }
  | { status: 'loaded'; result: ExamResult }
  | { status: 'unauthorized' }
  | { status: 'not-found' }
  | { status: 'not-submitted' }
  | { status: 'error' };

function ResultState({
  state,
  onRetry,
}: {
  state: Exclude<PageState, { status: 'loaded' }>;
  onRetry: () => void;
}) {
  const content = {
    loading: {
      title: 'Preparing your results',
      message: 'Retrieving your examination and answer review.',
    },
    unauthorized: {
      title: 'Sign in required',
      message: 'Please sign in to view this examination result.',
    },
    'not-found': {
      title: 'Result not found',
      message:
        'This examination result could not be found or is unavailable to your account.',
    },
    'not-submitted': {
      title: 'Examination not submitted',
      message:
        'Your results will be available after you submit the examination.',
    },
    error: {
      title: 'Unable to load results',
      message:
        'Something went wrong while retrieving your results. Please try again.',
    },
  }[state.status];

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        aria-live="polite"
      >
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
          {state.status === 'loading' ? (
            <span
              className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent"
              aria-label="Loading"
            />
          ) : (
            <span className="text-xl font-bold" aria-hidden="true">
              !
            </span>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
          JAMB CBT
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {content.title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {content.message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {state.status === 'unauthorized' && (
            <Link className="btn btn-primary min-h-11" href="/login">
              Sign In
            </Link>
          )}

          {state.status === 'error' && (
            <button
              className="btn btn-primary min-h-11"
              type="button"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}

          <Link className="btn btn-secondary min-h-11" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

function ScoreRing({ percentage }: { percentage: number }) {
  const safePercentage = Number.isFinite(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0;

  return (
    <div
      className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full sm:h-48 sm:w-48 print:h-32 print:w-32"
      style={{
        background: `conic-gradient(#047857 ${safePercentage}%, #e2e8f0 ${safePercentage}% 100%)`,
      }}
      role="img"
      aria-label={`Exam score: ${safePercentage}%`}
    >
      <div className="grid h-[calc(100%-14px)] w-[calc(100%-14px)] place-content-center rounded-full bg-white text-center">
        <span className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl print:text-3xl">
          {safePercentage}%
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Final score
        </span>
      </div>
    </div>
  );
}

function ReviewQuestion({
  question,
}: {
  question: ResultQuestion;
}) {
  const isCorrect = question.isCorrect === true;
  const isUnanswered = question.selectedOption === null;

  const statusLabel = isUnanswered
    ? 'Unanswered'
    : isCorrect
      ? 'Correct'
      : 'Incorrect';

  const statusStyle = isUnanswered
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : isCorrect
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-800';

  const imageSource = question.imagePath
    ? question.imagePath.startsWith('/')
      ? question.imagePath
      : `/${question.imagePath}`
    : null;

  const optionLetters = ['A', 'B', 'C', 'D'] as const;

  return (
    <article
      className="result-question overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby={`result-question-${question.id}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
            {question.sequence}
          </span>

          <h3
            id={`result-question-${question.id}`}
            className="font-bold text-slate-900"
          >
            Question {question.sequence}
          </h3>
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <p className="whitespace-pre-wrap text-base font-medium leading-7 text-slate-900">
          {question.questionText}
        </p>

        {(question.questionType === 'IMAGE' ||
          question.questionType === 'TEXT_WITH_IMAGE') &&
          imageSource && (
            <div className="relative mt-5 min-h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:min-h-56 print:min-h-32">
              <Image
                src={imageSource}
                alt={`Illustration for question ${question.sequence}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-contain p-3"
              />
            </div>
          )}

        <ol
          className="mt-5 grid gap-3"
          aria-label={`Answer choices for question ${question.sequence}`}
        >
          {optionLetters.map((letter) => {
            const isSelected = question.selectedOption === letter;
            const isAnswer = question.correctOption === letter;

            let optionStyle =
              'border-slate-200 bg-white text-slate-800';

            if (isAnswer) {
              optionStyle =
                'border-emerald-400 bg-emerald-50 text-emerald-950';
            } else if (isSelected) {
              optionStyle = 'border-red-300 bg-red-50 text-red-950';
            }

            return (
              <li
                key={letter}
                className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 sm:p-4 ${optionStyle}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-sm font-bold">
                  {letter}
                </span>

                <span className="min-w-0 flex-1 pt-1 text-sm leading-6">
                  {question.options[letter]}
                </span>

                <span className="max-w-32 shrink-0 text-right text-xs font-semibold sm:max-w-none">
                  {isSelected && isAnswer
                    ? 'Your answer · Correct'
                    : isAnswer
                      ? 'Correct answer'
                      : isSelected
                        ? 'Your answer'
                        : ''}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <p className="text-sm text-slate-700">
            Your answer:{' '}
            <span className="font-bold">
              {question.selectedOption ?? 'No answer'}
            </span>
          </p>

          <p className="text-sm text-emerald-800">
            Correct answer:{' '}
            <span className="font-bold">{question.correctOption}</span>
          </p>
        </div>

        {question.explanation && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              Explanation
            </h4>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ExamResultsPage() {
  const params = useParams<{ examId: string }>();

  const [state, setState] = useState<PageState>({
    status: 'loading',
  });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResult() {
      setState({ status: 'loading' });

      try {
        const response = await fetch(
          `/api/exams/${encodeURIComponent(params.examId)}/result`,
          {
            cache: 'no-store',
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          setState({ status: 'unauthorized' });
          return;
        }

        if (response.status === 404) {
          setState({ status: 'not-found' });
          return;
        }

        if (response.status === 409) {
          setState({ status: 'not-submitted' });
          return;
        }

        if (!response.ok) {
          setState({ status: 'error' });
          return;
        }

        const data: { result: ExamResult } = await response.json();

        if (
          !data.result ||
          !data.result.summary ||
          !Array.isArray(data.result.questions)
        ) {
          setState({ status: 'error' });
          return;
        }

        setState({
          status: 'loaded',
          result: data.result,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return;
        }

        setState({ status: 'error' });
      }
    }

    loadResult();

    return () => controller.abort();
  }, [params.examId, reloadKey]);

  if (state.status !== 'loaded') {
    return (
      <ResultState
        state={state}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  const { result } = state;

  const percentage = Number.isFinite(result.summary.percentage)
    ? Math.max(0, Math.min(100, result.summary.percentage))
    : 0;

  const submittedAt = result.exam.submittedAt
    ? new Date(result.exam.submittedAt).toLocaleString()
    : 'Completed';

  return (
    <main className="results-page min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-9 print:bg-white print:p-0">
      <style jsx global>{`
        @page {
          size: auto;
          margin: 14mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #111827 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden,
          .results-no-print {
            display: none !important;
          }

          .results-page {
            min-height: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .results-container {
            max-width: none !important;
          }

          .results-header,
          .results-summary,
          .result-question {
            box-shadow: none !important;
            break-inside: avoid;
          }

          .results-header {
            border: 1px solid #d1d5db !important;
            background: #ffffff !important;
            color: #111827 !important;
          }

          .results-header h1,
          .results-header p,
          .results-header time,
          .results-header span {
            color: #111827 !important;
          }

          .results-header .results-statistics {
            border-top: 1px solid #d1d5db !important;
            background: #f8fafc !important;
          }

          .results-header .results-statistics > div {
            border-color: #d1d5db !important;
          }

          .results-header .results-statistics p {
            color: #374151 !important;
          }

          .results-header .results-statistics p:last-child {
            color: #111827 !important;
          }

          .results-summary,
          .result-question {
            border-color: #d1d5db !important;
          }

          .result-question {
            margin-bottom: 10px !important;
            break-inside: avoid-page;
          }

          .result-question img {
            max-height: 180px !important;
          }

          a {
            color: #111827 !important;
            text-decoration: none !important;
          }

          section {
            break-inside: auto;
          }

          h1,
          h2,
          h3,
          h4 {
            break-after: avoid;
          }
        }
      `}</style>

      <div className="results-container mx-auto max-w-6xl">
        <header className="results-header overflow-hidden rounded-2xl bg-emerald-950 text-white shadow-sm">
          <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 print:hidden" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                  JAMB CBT · Results
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Examination complete
              </h1>

              <p className="mt-3 break-words text-lg font-semibold text-emerald-50">
                {result.exam.title}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-emerald-100">
                <span className="rounded-full border border-emerald-700 bg-emerald-900 px-3 py-1">
                  {result.exam.status}
                </span>

                <span aria-hidden="true" className="text-emerald-700">
                  •
                </span>

                <time dateTime={result.exam.submittedAt ?? undefined}>
                  Submitted {submittedAt}
                </time>
              </div>
            </div>

            <div className="flex justify-center lg:pr-4">
              <ScoreRing percentage={percentage} />
            </div>
          </div>

          <div className="results-statistics grid grid-cols-2 border-t border-emerald-800 bg-emerald-900/60 sm:grid-cols-4">
            {[
              {
                label: 'Total questions',
                value: result.summary.totalQuestions,
              },
              {
                label: 'Correct',
                value: result.summary.correctCount,
              },
              {
                label: 'Incorrect',
                value: result.summary.incorrectCount,
              },
              {
                label: 'Unanswered',
                value: result.summary.unansweredCount,
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`border-emerald-800 p-4 sm:px-6 sm:py-5 ${
                  index % 2 === 0 ? 'border-r' : ''
                } ${
                  index < 2 ? 'border-b sm:border-b-0' : ''
                } ${
                  index === 1 || index === 2 ? 'sm:border-r' : ''
                }`}
              >
                <p className="text-xs font-medium text-emerald-200">
                  {item.label}
                </p>

                <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="results-summary mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Your performance
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                Result summary
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                You scored {result.summary.score} out of{' '}
                {result.summary.totalQuestions} questions.
              </p>
            </div>

            <div className="results-no-print flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary min-h-11"
              >
                Print Result
              </button>

              <Link
                className="btn btn-secondary min-h-11"
                href="/dashboard"
              >
                Back to Dashboard
              </Link>

              <Link
                className="btn btn-secondary min-h-11"
                href="/simulation"
              >
                Take Another Exam
              </Link>
            </div>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Exam score percentage"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-emerald-700 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-slate-500">
            {percentage}% score
          </p>
        </section>

        <section className="mt-6" aria-labelledby="review-heading">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Learn from your answers
              </p>

              <h2
                id="review-heading"
                className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950"
              >
                Question review
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review your responses, correct answers, and explanations where available.
              </p>
            </div>

            <span className="self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
              {result.questions.length} questions
            </span>
          </div>

          {result.questions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="font-bold text-slate-900">
                No question review available
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                The result summary is available, but no question details were returned.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.questions.map((question) => (
                <ReviewQuestion
                  key={question.id}
                  question={question}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="results-no-print mt-8 border-t border-slate-200 py-6 print:hidden">
          <nav
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Results navigation"
          >
            <p className="text-sm text-slate-500">
              Keep practising to strengthen your preparation.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                className="btn btn-secondary min-h-11"
                href="/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className="btn btn-primary min-h-11"
                href="/simulation"
              >
                Start Another CBT
              </Link>
            </div>
          </nav>
        </footer>
      </div>
    </main>
  );
}
