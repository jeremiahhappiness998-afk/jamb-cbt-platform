'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Flag,
  LoaderCircle,
} from 'lucide-react';

export type AnswerChoice = 'A' | 'B' | 'C' | 'D';

type CBTState = {
  currentQuestionIndex: number;
  answers: Record<string, AnswerChoice>;
  markedForReview: Record<string, boolean>;
};

export type CBTQuestion = {
  id: string;
  sequence: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  questionType: string;
  imagePath: string | null;
};

export type ActiveExam = {
  id: string;
  title: string;
  totalQuestions: number;
  questions: CBTQuestion[];
};

const DEFAULT_EXAM_DURATION_SECONDS = 60 * 60;
const LOW_TIME_WARNING_SECONDS = 10 * 60;

type TimerState = {
  deadline: number;
  remainingSeconds: number;
  isTimeExpired: boolean;
};

function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ].join(':');
  }

  return [
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

function getTimeAccessibleLabel(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }

  parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);

  return `Time remaining: ${parts.join(', ')}`;
}

export function ExamLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-sm">
        <LoaderCircle
          className="h-5 w-5 animate-spin text-emerald-700"
          aria-hidden="true"
        />
        Loading examination...
      </div>
    </div>
  );
}

export function ExamError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-700">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="text-lg font-bold text-slate-950">{title}</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {message}
        </p>

        <Link
          href="/simulation"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Return to Simulation
        </Link>
      </div>
    </div>
  );
}

function CBTHeader({
  title,
  timer,
}: {
  title: string;
  timer: TimerState;
}) {
  const { remainingSeconds, isTimeExpired } = timer;

  const isLowTime =
    !isTimeExpired && remainingSeconds <= LOW_TIME_WARNING_SECONDS;

  const timeLabel = formatRemainingTime(remainingSeconds);

  return (
    <header className="bg-emerald-950 text-white shadow-sm">
      <div className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-md border border-emerald-700 bg-emerald-900 text-sm font-bold">
            JC
          </span>

          <span className="text-base font-bold">JAMB CBT</span>
        </Link>

        <div className="order-3 w-full min-w-0 border-t border-emerald-800 pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          <p className="truncate text-sm font-semibold sm:text-base">
            {title}{' '}
            <span className="font-normal text-emerald-200">
              — CBT Simulation
            </span>
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:ml-0 sm:gap-5">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase text-emerald-200">
              {isTimeExpired ? 'Time Expired' : 'Time Remaining'}
            </p>

            <p
              className={[
                'font-mono text-lg font-semibold tabular-nums',
                isLowTime ? 'text-amber-300' : '',
                isTimeExpired ? 'text-red-300' : '',
              ].join(' ')}
              aria-label={
                isTimeExpired
                  ? 'Time expired'
                  : getTimeAccessibleLabel(remainingSeconds)
              }
            >
              {timeLabel}
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Exam submission is not available yet"
            className="min-h-10 rounded-md border border-emerald-700 bg-emerald-900 px-3 text-sm font-semibold text-emerald-100 opacity-75 disabled:cursor-not-allowed sm:px-4"
          >
            Finish Exam
          </button>
        </div>
      </div>
    </header>
  );
}

function QuestionOption({
  choice,
  text,
  selected,
  onSelect,
}: {
  choice: AnswerChoice;
  text: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
        selected
          ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
          : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-slate-50',
      ].join(' ')}
    >
      <span
        className={[
          'grid h-9 w-9 shrink-0 place-items-center rounded-md border text-sm font-bold',
          selected
            ? 'border-emerald-700 bg-emerald-700 text-white'
            : 'border-slate-300 bg-slate-50 text-slate-700',
        ].join(' ')}
        aria-hidden="true"
      >
        {choice}
      </span>

      <span className="min-w-0 flex-1 pt-1 text-sm leading-6 sm:text-base">
        {text}
      </span>

      {selected ? (
        <span
          className="mt-1 shrink-0 text-emerald-700"
          aria-label="Selected"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
}: {
  question: CBTQuestion;
  selectedAnswer?: AnswerChoice;
  onSelectAnswer: (answer: AnswerChoice) => void;
}) {
  const options: AnswerChoice[] = ['A', 'B', 'C', 'D'];

  return (
    <section
      aria-labelledby={`question-${question.id}`}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
            Question {question.sequence}
          </p>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Select one answer
          </span>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-7">
        <h1
          id={`question-${question.id}`}
          className="max-w-4xl text-base font-semibold leading-7 text-slate-950 sm:text-lg sm:leading-8"
        >
          {question.questionText}
        </h1>

        {question.imagePath ? (
          <div className="relative mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="relative min-h-48 w-full">
              <Image
                src={question.imagePath}
                alt="Question illustration"
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {options.map((choice) => (
            <QuestionOption
              key={choice}
              choice={choice}
              text={question.options[choice]}
              selected={selectedAnswer === choice}
              onSelect={() => onSelectAnswer(choice)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestionPalette({
  questions,
  currentQuestionIndex,
  answers,
  markedForReview,
  onNavigate,
}: {
  questions: CBTQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, AnswerChoice>;
  markedForReview: Record<string, boolean>;
  onNavigate: (index: number) => void;
}) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-950">
          Question Palette
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select a question to jump directly to it.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
        {questions.map((item, index) => {
          const answered = Boolean(answers[item.id]);
          const marked = Boolean(markedForReview[item.id]);
          const current = index === currentQuestionIndex;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(index)}
              aria-label={`Question ${item.sequence}${
                answered ? ', answered' : ', unanswered'
              }${marked ? ', marked for review' : ''}${
                current ? ', current question' : ''
              }`}
              aria-current={current ? 'step' : undefined}
              className={[
                'relative grid min-h-10 place-items-center rounded-md border text-sm font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
                current
                  ? 'border-emerald-800 bg-emerald-800 text-white'
                  : answered
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white',
              ].join(' ')}
            >
              {item.sequence}

              {marked ? (
                <span
                  className={[
                    'absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full',
                    current
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  <Flag className="h-2.5 w-2.5 fill-current" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-800" />
          Current
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-emerald-200 bg-emerald-50" />
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-slate-200 bg-slate-50" />
          Unanswered
        </div>

        <div className="flex items-center gap-2">
          <Flag className="h-3.5 w-3.5 text-amber-700" />
          Marked for review
        </div>
      </div>
    </aside>
  );
}

function CBTNavigation({
  currentQuestionIndex,
  total,
  isMarked,
  onPrevious,
  onNext,
  onToggleReview,
}: {
  currentQuestionIndex: number;
  total: number;
  isMarked: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleReview: () => void;
}) {
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === total - 1;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      <button
        type="button"
        onClick={onToggleReview}
        aria-pressed={isMarked}
        className={[
          'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
          isMarked
            ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        ].join(' ')}
      >
        <Flag
          className="h-4 w-4"
          fill={isMarked ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        {isMarked ? 'Unmark Review' : 'Mark for Review'}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function CBTExamScreen({
  exam,
}: {
  exam: ActiveExam;
}) {
  const examDeadline = useMemo(
    () => Date.now() + DEFAULT_EXAM_DURATION_SECONDS * 1000,
    [],
  );

  const [timer, setTimer] = useState<TimerState>(() => {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((examDeadline - Date.now()) / 1000),
    );

    return {
      deadline: examDeadline,
      remainingSeconds,
      isTimeExpired: remainingSeconds <= 0,
    };
  });

  const [state, setState] = useState<CBTState>({
    currentQuestionIndex: 0,
    answers: {},
    markedForReview: {},
  });

  const total = exam.questions.length;

  const currentQuestionIndex = Math.max(
    0,
    Math.min(
      state.currentQuestionIndex,
      Math.max(total - 1, 0),
    ),
  );

  const question = exam.questions[currentQuestionIndex];

  useEffect(() => {
    function updateTimer() {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((timer.deadline - Date.now()) / 1000),
      );

      setTimer((current) => {
        const isTimeExpired = remainingSeconds <= 0;

        if (
          current.remainingSeconds === remainingSeconds &&
          current.isTimeExpired === isTimeExpired
        ) {
          return current;
        }

        return {
          ...current,
          remainingSeconds,
          isTimeExpired,
        };
      });
    }

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer.deadline]);

  function selectAnswer(answer: AnswerChoice) {
    if (!question || timer.isTimeExpired) {
      return;
    }

    setState((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [question.id]: answer,
      },
    }));
  }

  function navigateTo(index: number) {
    setState((current) => ({
      ...current,
      currentQuestionIndex: Math.max(
        0,
        Math.min(index, Math.max(total - 1, 0)),
      ),
    }));
  }

  function toggleReview() {
    if (!question || timer.isTimeExpired) {
      return;
    }

    setState((current) => ({
      ...current,
      markedForReview: {
        ...current.markedForReview,
        [question.id]: !current.markedForReview[question.id],
      },
    }));
  }

  function goPrevious() {
    navigateTo(currentQuestionIndex - 1);
  }

  function goNext() {
    navigateTo(currentQuestionIndex + 1);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          target.closest(
            'input, textarea, select, [contenteditable="true"]',
          )
        )
      ) {
        return;
      }

      if (!question || timer.isTimeExpired) {
        return;
      }

      const key = event.key.toLowerCase();

      if (
        key === 'a' ||
        key === 'b' ||
        key === 'c' ||
        key === 'd'
      ) {
        event.preventDefault();

        const answer = key.toUpperCase() as AnswerChoice;

        setState((current) => ({
          ...current,
          answers: {
            ...current.answers,
            [question.id]: answer,
          },
        }));
      } else if (key === 'arrowleft' || key === 'p') {
        event.preventDefault();

        setState((current) => ({
          ...current,
          currentQuestionIndex: Math.max(
            0,
            current.currentQuestionIndex - 1,
          ),
        }));
      } else if (key === 'arrowright' || key === 'n') {
        event.preventDefault();

        setState((current) => ({
          ...current,
          currentQuestionIndex: Math.min(
            total - 1,
            current.currentQuestionIndex + 1,
          ),
        }));
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [question, timer.isTimeExpired, total]);

  if (!question) {
    return (
      <ExamError
        title="No questions available"
        message="No questions are available for this examination."
      />
    );
  }

  const selectedAnswer = state.answers[question.id];
  const isMarked = Boolean(state.markedForReview[question.id]);

  return (
    <div className="min-h-screen bg-slate-100">
      <CBTHeader
        title={exam.title.replace(/\s+Exam$/, '')}
        timer={timer}
      />

      {timer.isTimeExpired ? (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-900"
        >
          Your examination time has expired. Submission and scoring will be
          handled in a later phase.
        </div>
      ) : timer.remainingSeconds <= LOW_TIME_WARNING_SECONDS ? (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950"
        >
          Your examination time is running low.
        </div>
      ) : null}

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Active Examination
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Question {currentQuestionIndex + 1} of {total}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>
              Answered:{' '}
              <span className="font-semibold text-slate-800">
                {Object.keys(state.answers).length}
              </span>
              {' / '}
              {total}
            </p>

            <p className="mt-1">
              Marked:{' '}
              <span className="font-semibold text-slate-800">
                {Object.values(state.markedForReview).filter(Boolean).length}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-5">
            <QuestionCard
              question={question}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={selectAnswer}
            />

            <CBTNavigation
              currentQuestionIndex={currentQuestionIndex}
              total={total}
              isMarked={isMarked}
              onPrevious={goPrevious}
              onNext={goNext}
              onToggleReview={toggleReview}
            />

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm">
              <span className="font-semibold text-slate-700">
                Keyboard shortcuts:
              </span>{' '}
              A/B/C/D to select an answer · P or ← for previous · N or → for
              next.
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-5">
              <QuestionPalette
                questions={exam.questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={state.answers}
                markedForReview={state.markedForReview}
                onNavigate={navigateTo}
              />
            </div>
          </div>
        </div>

        <details className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden">
          <summary className="cursor-pointer px-4 py-4 text-sm font-bold text-slate-950">
            Question Palette
          </summary>

          <div className="border-t border-slate-200 p-4">
            <QuestionPalette
              questions={exam.questions}
              currentQuestionIndex={currentQuestionIndex}
              answers={state.answers}
              markedForReview={state.markedForReview}
              onNavigate={navigateTo}
            />
          </div>
        </details>
      </main>
    </div>
  );
}

export function CBTExamLoading() {
  return <ExamLoading />;
}