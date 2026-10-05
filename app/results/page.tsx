"use client";

import { useState } from 'react';

export default function SimulationPage() {
  const [started, setStarted] = useState(false);

  async function startSimulation() {
    const response = await fetch('/api/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 10, subject: 'Biology' }),
    });

    const data = await response.json();
    if (response.ok) {
      setStarted(true);
      console.log('Started simulation', data);
    }
  }

  return (
    <main className="page-shell max-w-6xl">
      <div className="card p-8">
        <div className="mb-6">
          <div className="text-sm uppercase tracking-[0.2em] text-emerald-700">JAMB CBT Simulation</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Real exam rehearsal</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
          The simulation includes timed CBT flow, question navigation, review, and result submission.
        </div>

        <button onClick={startSimulation} className="btn btn-primary mt-8">
          {started ? 'Simulation Started' : 'Start CBT Simulation'}
        </button>
      </div>
    </main>
  );
}
