
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PracticeOption = "A" | "B" | "C" | "D";

type PracticeQuestion = {
  id: string;
  questionNumber: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: string;
  questionType: string;
  imagePath: string | null;
  topic: string | null;
  selectedOption: PracticeOption | null;
  isCorrect: boolean | null;
  correctOption: PracticeOption | null;
  explanation: string | null;
};

type PracticeSessionData = {
  id: string;
  subject: string;
  count: number;
  startedAt: string;
  completedAt: string | null;
};

type PracticeSummary = {
  sessionId: string;
  subject: string;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  completedAt: string;
};

function formatPracticeTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PracticeSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<PracticeSessionData | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [completing, setCompleting] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Review mode is separate from an active practice session.
  const [reviewing, setReviewing] = useState(false);

  // Prevent multiple completion requests.
  const completionStarted = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch(
          `/api/practice/${encodeURIComponent(params.sessionId)}`,
          { cache: "no-store" }
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "This practice session is unavailable or has expired. Please start a new session."
          );
        }

        const data: {
          session: PracticeSessionData;
          questions: PracticeQuestion[];
        } = await response.json();

        if (cancelled) return;

        setSession(data.session);
        setQuestions(data.questions);

        const durationParam = new URLSearchParams(
          window.location.search
        ).get("durationMinutes");

        const requestedDuration =
          durationParam === null ? 0 : Number(durationParam);

        setDurationMinutes(
          Number.isInteger(requestedDuration) &&
            requestedDuration >= 0 &&
            requestedDuration <= 180
            ? requestedDuration
            : 0
        );

        // Restore the summary when opening an already-completed session.
        if (data.session.completedAt) {
          completionStarted.current = true;

          const answered = data.questions.filter(
            (q) => q.selectedOption !== null
          ).length;

          const correct = data.questions.filter(
            (q) => q.isCorrect === true
          ).length;

          setSummary({
            sessionId: data.session.id,
            subject: data.session.subject,
            totalQuestions: data.questions.length,
            answeredCount: answered,
            unansweredCount: data.questions.length - answered,
            correctCount: correct,
            wrongCount: answered - correct,
            percentage:
              answered > 0 ? Math.round((correct / answered) * 100) : 0,
            completedAt: data.session.completedAt,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load practice session."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [params.sessionId, router]);

  async function handleSelectOption(option: PracticeOption) {
    // Completed sessions must never accept new answers.
    if (reviewing || summary || completionStarted.current) return;

    const currentQ = questions[currentIndex];

    if (!currentQ || answering) return;

    if (currentQ.selectedOption === option) return;

    setAnswering(true);

    try {
      const response = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQ.id,
          selectedOption: option,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record answer.");
      }

      const result: {
        isCorrect: boolean;
        correctOption: PracticeOption;
        explanation: string | null;
      } = await response.json();

      setQuestions((previous) =>
        previous.map((question, index) =>
          index === currentIndex
            ? {
                ...question,
                selectedOption: option,
                isCorrect: result.isCorrect,
                correctOption: result.correctOption,
                explanation: result.explanation,
              }
            : question
        )
      );
    } catch (answerError) {
      console.error("Answer error:", answerError);
      setError("Unable to save your answer. Please try again.");
    } finally {
      setAnswering(false);
    }
  }

  const handleCompleteSession = useCallback(async () => {
    if (
      completionStarted.current ||
      completing ||
      summary ||
      reviewing
    ) {
      return;
    }

    // Lock the session before sending the completion request.
    completionStarted.current = true;
    setCompleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/practice/${encodeURIComponent(params.sessionId)}/complete`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Unable to complete the practice session.");
      }

      const data: { summary: PracticeSummary } = await response.json();

      setSummary(data.summary);
      setSecondsRemaining(null);

      // Reloading this session will now treat it as completed,
      // provided the completion API persists completedAt correctly.
      setSession((previous) =>
        previous
          ? { ...previous, completedAt: data.summary.completedAt }
          : previous
      );
    } catch (completionError) {
      console.error("Complete session error:", completionError);

      // Allow a retry if the completion request failed.
      completionStarted.current = false;

      setError(
        "Unable to finish practice. Please try again."
      );
    } finally {
      setCompleting(false);
    }
  }, [completing, params.sessionId, reviewing, summary]);

  useEffect(() => {
    // A completed session, summary screen, or review screen
    // must never have a running countdown.
    if (
      !session ||
      durationMinutes === null ||
      durationMinutes === 0 ||
      session.completedAt ||
      summary ||
      reviewing ||
      completionStarted.current
    ) {
      setSecondsRemaining(null);
      return;
    }

    const startTime = new Date(session.startedAt).getTime();

    if (!Number.isFinite(startTime)) {
      return;
    }

    const deadline = startTime + durationMinutes * 60 * 1000;

  

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
      );

      setSecondsRemaining(remaining);

      if (remaining === 0) {
        if (intervalId !== undefined) {
          window.clearInterval(intervalId);
        }

        void handleCompleteSession();
      }
    };

   const intervalId = window.setInterval(updateTimer, 1000);

    updateTimer();

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    session,
    durationMinutes,
    summary,
    reviewing,
    handleCompleteSession,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
          Loading practice session...
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            ⚠️
          </div>

          <h1 className="mt-4 text-xl font-extrabold text-slate-900">
            Practice Session Error
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/practice" className="btn btn-primary min-h-11">
              Start New Practice
            </Link>

            <Link href="/dashboard" className="btn btn-secondary min-h-11">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Show the results screen unless the student has entered review mode.
  if (summary && !reviewing) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="card overflow-hidden p-6 sm:p-8">
            <div className="border-b border-slate-200 pb-5 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                PRACTICE SUMMARY
              </span>

              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Session Complete!
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                {session.subject} Practice Session
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Accuracy
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-800">
                  {summary.percentage}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Correct
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {summary.correctCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Incorrect
                </p>
                <p className="mt-1 text-2xl font-extrabold text-red-600">
                  {summary.wrongCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {summary.totalQuestions}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-emerald-50/70 p-5 text-center">
              <p className="text-sm font-medium text-emerald-900">
                {summary.percentage >= 70
                  ? "Outstanding job! You demonstrated strong mastery."
                  : summary.percentage >= 50
                    ? "Good effort! Regular practice will continue to build your speed and accuracy."
                    : "Review the questions and explanations to strengthen your understanding."}
              </p>

              <p className="mt-2 text-xs text-emerald-800">
                {summary.answeredCount} answered ·{" "}
                {summary.unansweredCount} unanswered
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setCurrentIndex(0);
                  setReviewing(true);
                }}
                className="btn btn-secondary min-h-11 px-5"
              >
                Review My Questions
              </button>

              <Link
                href="/practice"
                className="btn btn-primary min-h-11 px-5"
              >
                Practise Again →
              </Link>

              <Link
                href="/dashboard"
                className="btn btn-secondary min-h-11 px-5"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const answeredCount = questions.filter(
    (question) => question.selectedOption !== null
  ).length;

  
  const isAnswered =
    currentQuestion !== undefined &&
    currentQuestion.selectedOption !== null;

  const optionLetters: PracticeOption[] = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
              title="Return to practice selection"
            >
              ←
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    reviewing
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {reviewing ? "REVIEW MODE" : "PRACTICE MODE"}
                </span>

                <span className="text-xs text-slate-500">
                  {reviewing ? "Completed session · Read only" : "Practice session"}
                </span>
              </div>

              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                {session.subject}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!reviewing &&
              !summary &&
              durationMinutes !== null &&
              durationMinutes > 0 &&
              secondsRemaining !== null && (
                <div
                  role="timer"
                  aria-label={`Time remaining: ${formatPracticeTime(secondsRemaining)}`}
                  className={`rounded-xl border px-3 py-2 text-center ${
                    secondsRemaining <= 60
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide">
                    Time left
                  </p>
                  <p className="font-mono text-lg font-extrabold">
                    {formatPracticeTime(secondsRemaining)}
                  </p>
                </div>
              )}

            <div className="text-right text-xs">
              <p className="font-semibold text-slate-500">
                {reviewing ? "Review progress" : "Progress"}
              </p>

              <p className="text-sm font-bold text-slate-900">
                {reviewing
                  ? `${currentIndex + 1} / ${total} questions`
                  : `${answeredCount} / ${total} answered`}
              </p>
            </div>

            {reviewing ? (
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="btn btn-primary min-h-10 px-4 text-xs font-bold"
              >
                Back to Results
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteSession}
                disabled={completing || Boolean(summary)}
                className="btn btn-secondary min-h-10 px-4 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
              >
                {completing ? "Completing..." : "Finish Practice"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {reviewing && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <strong>Review mode:</strong> Your answers are locked. Navigate
            through the questions to see your responses and the correct
            answers. The practice timer is stopped.
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {currentQuestion && (
          <>
            <section
              className="card p-5 sm:p-7"
              aria-labelledby={`practice-q-${currentQuestion.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase text-emerald-700">
                    Question {currentIndex + 1} of {total}
                  </span>

                  {currentQuestion.topic && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {currentQuestion.topic}
                    </span>
                  )}
                </div>

                <span className="text-xs font-medium capitalize text-slate-400">
                  {currentQuestion.difficulty} difficulty
                </span>
              </div>

              <div className="mt-5">
                <p
                  id={`practice-q-${currentQuestion.id}`}
                  className="whitespace-pre-wrap text-base font-semibold leading-7 text-slate-900 sm:text-lg sm:leading-8"
                >
                  {currentQuestion.questionText}
                </p>

                {currentQuestion.imagePath && (
                  <div className="relative mt-4 min-h-48 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <Image
                      src={
                        currentQuestion.imagePath.startsWith("/")
                          ? currentQuestion.imagePath
                          : `/${currentQuestion.imagePath}`
                      }
                      alt="Question illustration"
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3" role="group" aria-label="Answer options">
                {optionLetters.map((letter) => {
                  const optionText = currentQuestion.options[letter];
                  const isSelected =
                    currentQuestion.selectedOption === letter;

                  const isCorrectAnswer =
                    currentQuestion.correctOption === letter;

                  let optionStyles =
                    "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-slate-50";

                  if (isAnswered || reviewing) {
                    if (isCorrectAnswer) {
                      optionStyles =
                        "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500";
                    } else if (isSelected && !currentQuestion.isCorrect) {
                      optionStyles =
                        "border-red-400 bg-red-50 text-red-950 ring-1 ring-red-400";
                    } else {
                      optionStyles =
                        "border-slate-200 bg-slate-50 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={
                        answering ||
                        reviewing ||
                        Boolean(summary) ||
                        completionStarted.current
                      }
                      onClick={() => handleSelectOption(letter)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-default ${optionStyles}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                          isCorrectAnswer && (isAnswered || reviewing)
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : isSelected &&
                                !currentQuestion.isCorrect &&
                                (isAnswered || reviewing)
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-300 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {letter}
                      </span>

                      <span className="min-w-0 flex-1 pt-1 text-sm leading-6 sm:text-base">
                        {optionText}
                      </span>

                      {isAnswered && isCorrectAnswer && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          ✓ Correct answer
                        </span>
                      )}

                      {isAnswered &&
                        isSelected &&
                        !currentQuestion.isCorrect && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                            Your answer
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  className={`mt-6 rounded-2xl border p-5 ${
                    currentQuestion.isCorrect
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-amber-200 bg-amber-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {currentQuestion.isCorrect ? "🎉" : "💡"}
                    </span>

                    <h3
                      className={`text-sm font-extrabold uppercase tracking-wide ${
                        currentQuestion.isCorrect
                          ? "text-emerald-900"
                          : "text-amber-950"
                      }`}
                    >
                      {currentQuestion.isCorrect
                        ? "Correct! Well done."
                        : `Incorrect. The correct answer is Option ${currentQuestion.correctOption}.`}
                    </h3>
                  </div>

                  {currentQuestion.explanation && (
                    <div className="mt-3 text-sm leading-relaxed text-slate-700">
                      <p className="font-semibold text-slate-900">
                        Explanation:
                      </p>

                      <p className="mt-1 whitespace-pre-wrap">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {reviewing && !isAnswered && (
                <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  You did not answer this question during the practice
                  session.
                  {currentQuestion.correctOption && (
                    <span className="mt-2 block font-semibold text-emerald-800">
                      Correct answer: Option {currentQuestion.correctOption}
                    </span>
                  )}
                  {currentQuestion.explanation && (
                    <span className="mt-2 block whitespace-pre-wrap">
                      {currentQuestion.explanation}
                    </span>
                  )}
                </p>
              )}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((previous) => Math.max(0, previous - 1))
                }
                disabled={currentIndex === 0}
                className="btn btn-secondary min-h-11 px-5 disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-xs font-medium text-slate-500">
                Question {currentIndex + 1} of {total}
              </span>

              {currentIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((previous) =>
                      Math.min(total - 1, previous + 1)
                    )
                  }
                  className="btn btn-primary min-h-11 px-6"
                >
                  Next Question →
                </button>
              ) : reviewing ? (
                <button
                  type="button"
                  onClick={() => setReviewing(false)}
                  className="btn btn-primary min-h-11 px-6"
                >
                  Back to Results
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteSession}
                  disabled={completing || Boolean(summary)}
                  className="btn btn-primary min-h-11 px-6"
                >
                  {completing ? "Completing..." : "Finish Session ✓"}
                </button>
              )}
            </div>

            <div className="card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Question Navigator
              </p>

              <div className="flex flex-wrap gap-2">
                {questions.map((question, index) => {
                  const isCurrent = index === currentIndex;
                  const answered = question.selectedOption !== null;
                  const correct = question.isCorrect === true;

                  let buttonClass =
                    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

                  if (answered) {
                    buttonClass = correct
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-bold"
                      : "border-red-400 bg-red-50 text-red-800 font-bold";
                  }

                  if (isCurrent) {
                    buttonClass += " ring-2 ring-emerald-700 ring-offset-2";
                  }

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs transition ${buttonClass}`}
                      title={`Go to Question ${index + 1}`}
                      aria-label={`Go to Question ${index + 1}`}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
