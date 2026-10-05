"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Subject = {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const meResponse = await fetch('/api/me');
        if (!meResponse.ok) {
          router.replace('/login');
          return;
        }

        const meData = await meResponse.json();
        setUser(meData.user);

        const subjectsResponse = await fetch('/api/questions/subjects');
        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData.subjects || []);
        }
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return <main className="page-shell text-slate-700">Loading...</main>;
  }

  if (error) {
    return <main className="page-shell text-red-700">{error}</main>;
  }

  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Welcome back</p>
          <h1 className="text-3xl font-bold text-slate-900">{user?.name || 'Student'} </h1>
        </div>
        <div className="flex gap-3">
          <a href="/practice" className="btn btn-primary">START PRACTICE</a>
          <a href="/simulation" className="btn btn-secondary">START CBT SIMULATION</a>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { label: 'Questions Answered', value: '0' },
          { label: 'Average Score', value: '0%' },
          { label: 'Exams Completed', value: '0' },
          { label: 'Study Streak', value: '0 days' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Available subjects</h2>
          <div className="mt-5 space-y-4">
            {subjects.length === 0 ? (
              <div className="text-slate-500">No subjects available yet.</div>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 text-base font-semibold text-slate-900">{subject.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {subject.topics.map((topic) => (
                      <span key={topic.id} className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                        {topic.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Profile</h2>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="mb-2"><span className="font-semibold">Name:</span> {user?.name}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {user?.email}</div>
            <div><span className="font-semibold">Role:</span> {user?.role}</div>
          </div>
          <a href="/practice" className="btn btn-primary mt-5 w-full">PRACTICE NOW</a>
        </div>
      </section>
    </main>
  );
}
