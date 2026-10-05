export default function ResultsPage() {
  return (
    <main className="page-shell max-w-5xl">
      <div className="card p-8">
        <h1 className="text-4xl font-bold text-slate-900">Your Result</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-xl font-semibold text-slate-700">Biology</div>
            <div className="mt-2 text-5xl font-bold text-slate-900">72%</div>
            <div className="mt-2 text-lg text-slate-600">29 / 40</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
              <div>Correct <span className="block text-2xl font-bold text-slate-900">29</span></div>
              <div>Wrong <span className="block text-2xl font-bold text-slate-900">11</span></div>
              <div>Unanswered <span className="block text-2xl font-bold text-slate-900">0</span></div>
              <div>Time Used <span className="block text-2xl font-bold text-slate-900">38:42</span></div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Performance Breakdown</h2>
          <div className="mt-5 space-y-4">
            {[
              ['Genetics', '85%'],
              ['Ecology', '60%'],
              ['Cell Biology', '75%'],
              ['Human Biology', '70%'],
            ].map(([topic, score]) => (
              <div key={topic}>
                <div className="mb-1 flex justify-between text-sm text-slate-700">
                  <span>{topic}</span>
                  <span>{score}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-700" style={{ width: score }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-amber-50 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Areas to improve</h2>
          <div className="mt-3 text-lg font-semibold text-slate-900">Ecology</div>
          <p className="mt-2 text-slate-700">You answered 6 of 10 questions correctly.</p>
          <p className="mt-3 text-slate-700">Recommended: Practice more Ecology questions.</p>
        </div>
      </div>
    </main>
  );
}
