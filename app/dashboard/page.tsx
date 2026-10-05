const stats = [
  { label: 'Questions Answered', value: '486' },
  { label: 'Average Score', value: '74%' },
  { label: 'Exams Completed', value: '12' },
  { label: 'Study Streak', value: '8 days' },
];

const subjects = [
  ['Biology', '82%'],
  ['Chemistry', '71%'],
  ['Physics', '69%'],
  ['Mathematics', '78%'],
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Welcome back</p>
          <h1 className="text-3xl font-bold text-slate-900">Continue your preparation.</h1>
        </div>
        <div className="flex gap-3">
          <a href="/practice" className="btn btn-primary">START PRACTICE</a>
          <a href="/simulation" className="btn btn-secondary">START CBT SIMULATION</a>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Recent performance</h2>
          <div className="mt-5 space-y-4">
            {subjects.map(([subject, score]) => (
              <div key={subject}>
                <div className="mb-1 flex justify-between text-sm text-slate-700">
                  <span>{subject}</span>
                  <span>{score}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-700" style={{ width: score }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Recommended practice</h2>
          <div className="mt-4 rounded-xl bg-emerald-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Ecology</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">15 questions</div>
            <p className="mt-2 text-sm text-slate-600">Your ecology performance is still below your other Biology topics.</p>
          </div>
          <a href="/practice" className="btn btn-primary mt-5 w-full">PRACTICE NOW</a>
        </div>
      </section>
    </main>
  );
}
