"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Subject = {
  id: string;
  name: string;
};

export default function PracticePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(1);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        const response = await fetch('/api/questions/subjects', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load available subjects.');
        }
        const data: { subjects: Subject[] } = await response.json();
        setSubjects(data.subjects);
        setSubject(data.subjects[0]?.name ?? '');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load available subjects.');
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, []);

  async function startPractice() {
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/exams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, subject }),
      });
      const data: { examId?: string; error?: string } = await response.json();
      if (!response.ok || !data.examId) {
        setError(data.error || 'Unable to start this examination.');
        return;
      }

      router.push(`/simulation/${data.examId}`);
    } catch {
      setError('Unable to start this examination. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="page-shell max-w-4xl">
      <section className="card mx-auto max-w-2xl p-6 sm:p-9">
        <p className="text-sm font-semibold uppercase text-emerald-800">JAMB CBT</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Start an examination</h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          Choose a subject from your local question bank and prepare to begin.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="block text-sm font-semibold text-slate-800">
            Subject
            <select
              className="mt-2 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              disabled={loadingSubjects || subjects.length === 0}
            >
              {subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Questions
            <input
              className="mt-2 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              type="number"
              min={1}
              max={180}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
        </div>

        {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <button
          type="button"
          className="btn btn-primary mt-7 min-h-12 w-full sm:w-auto"
          onClick={startPractice}
          disabled={loadingSubjects || starting || !subject || count < 1}
        >
          {loadingSubjects ? 'Loading subjects...' : starting ? 'Starting examination...' : 'Start CBT'}
        </button>
      </section>
    </main>
  );
}
