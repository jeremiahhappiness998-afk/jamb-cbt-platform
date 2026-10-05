"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSession() {
      const response = await fetch('/api/me');
      if (!response.ok) {
        router.replace('/login');
        return;
      }

      const data = await response.json();
      const isUserAdmin = data.user?.role === 'ADMIN';
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) {
        router.replace('/dashboard');
        return;
      }

      setLoading(false);
    }

    loadSession();
  }, [router]);

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Select a JSON file to import.');
      return;
    }

    try {
      setError('');
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await fetch('/api/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Import failed.');
        return;
      }

      setSummary(data.summary || data);
    } catch {
      setError('Invalid JSON file. Please upload a valid question bank export.');
    }
  }

  if (loading) {
    return <main className="page-shell">Loading...</main>;
  }

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {['Browse Questions', 'Add Question', 'Import JSON', 'Import CSV'].map((label) => (
          <div key={label} className="card p-5">
            <div className="text-lg font-semibold text-slate-900">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-xl font-bold text-slate-900">Import Questions</h2>

        <div className="mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
            className="hidden"
          />

          <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-600">
            {fileName ? <span>Selected file: {fileName}</span> : 'Upload JSON or CSV'}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>Choose File</button>
          <button className="btn btn-secondary" onClick={handleImport}>Import</button>
        </div>

        {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {summary ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="font-semibold">Import summary</div>
            <div className="mt-2">Total: {summary.total}</div>
            <div>Valid: {summary.valid}</div>
            <div>Duplicates: {summary.duplicates}</div>
            <div>Failed: {summary.failed}</div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
