export default function AdminPage() {
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
        <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-600">
          Upload JSON or CSV
        </div>
        <div className="mt-6 flex gap-3">
          <button className="btn btn-primary">Choose File</button>
          <button className="btn btn-secondary">Import</button>
        </div>
      </div>
    </main>
  );
}
