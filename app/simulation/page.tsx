"use client";

import { useState } from 'react';

export default function PracticePage() {
  const [started, setStarted] = useState(false);

  async function startPractice() {
    const response = await fetch('/api/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 5, subject: 'Biology' }),
    });

    const data = await response.json();
    if (response.ok) {
      setStarted(true);
      console.log('Started exam', data);
    }
  }

  return (
    <main className="page-shell max-w-4xl">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-slate-900">Practice Mode</h1>
        <p className="mt-3 text-slate-600">Choose a subject and start a guided practice session.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Use of English'].map((subject) => (
            <button key={subject} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              {subject}
            </button>
          ))}
        </div>

        <button onClick={startPractice} className="btn btn-primary mt-8">
          {started ? 'Practice Session Started' : 'Start Practice'}
        </button>
      </div>
    </main>
  );
}
