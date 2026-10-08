"use client";

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    async function loadResult() {
      const resultResponse = await fetch('/api/exams/latest');
      if (!resultResponse.ok) return;
      const data = await resultResponse.json();
      setResult(data.result || null);
    }

    loadResult();
  }, []);

  if (!result) {
    return <main className="page-shell">No exam result available yet.</main>;
  }

  return (
    <main className="page-shell max-w-5xl">
      <div className="card p-8">
        <h1 className="text-4xl font-bold text-slate-900">Your Result</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-xl font-semibold text-slate-700">Performance</div>
            <div className="mt-2 text-5xl font-bold text-slate-900">{result.percentage}%</div>
            <div className="mt-2 text-lg text-slate-600">{result.correct} / {result.totalQuestions}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
              <div>Correct <span className="block text-2xl font-bold text-slate-900">{result.correct}</span></div>
              <div>Wrong <span className="block text-2xl font-bold text-slate-900">{result.wrong}</span></div>
              <div>Unanswered <span className="block text-2xl font-bold text-slate-900">{result.unanswered}</span></div>
              <div>Status <span className="block text-2xl font-bold text-slate-900">{result.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
