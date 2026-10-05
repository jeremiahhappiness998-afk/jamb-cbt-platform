export default function SimulationPage() {
  return (
    <main className="page-shell max-w-6xl">
      <div className="card p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-emerald-700">JAMB CBT Simulation</div>
            <div className="text-2xl font-bold text-slate-900">Question 18</div>
          </div>
          <div className="rounded-lg bg-slate-100 px-4 py-2 text-lg font-bold text-slate-900">01:42:18</div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
          <div>
            <p className="mb-4 text-xl font-medium leading-8 text-slate-900">
              The process by which green plants manufacture their food is known as __________.
            </p>
            <div className="space-y-3">
              {['Respiration', 'Transpiration', 'Photosynthesis', 'Germination'].map((option, index) => {
                const letter = ['A', 'B', 'C', 'D'][index];
                return (
                  <button key={option} className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-500">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">{letter}</span>
                    <span className="flex-1 text-slate-700">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button className="btn btn-secondary">Previous</button>
              <button className="btn btn-primary">Next</button>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Question palette</div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }, (_, index) => index + 1).map((num) => (
                <button
                  key={num}
                  className={`flex h-10 items-center justify-center rounded-md border text-sm font-medium ${
                    num === 18 ? 'border-emerald-700 bg-emerald-100 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {String(num).padStart(2, '0')}
                </button>
              ))}
            </div>
            <div className="mt-6 text-sm text-slate-600">Answered: 17/40</div>
            <button className="btn btn-secondary mt-4 w-full">Mark for Review</button>
          </aside>
        </div>
      </div>
    </main>
  );
}
