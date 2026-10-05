const subjects = ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="page-shell flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-emerald-800">JAMB Prep</div>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-700 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#practice">Practice</a>
            <a href="#simulation">CBT Simulation</a>
            <a href="#subjects">Subjects</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex gap-3">
            <a href="/login" className="btn btn-secondary">Login</a>
            <a href="/register" className="btn btn-primary">Start Practicing</a>
          </div>
        </div>
      </header>

      <section className="page-shell grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Prepare smarter.
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Practice Like the Real Exam.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Practice JAMB questions, improve weak areas, and experience realistic CBT simulation designed to
            help students prepare with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/dashboard" className="btn btn-primary">START PRACTICING</a>
            <a href="/simulation" className="btn btn-secondary">TRY CBT SIMULATION</a>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['20K+', 'Questions'],
              ['74%', 'Avg score'],
              ['12+', 'Exams'],
            ].map(([value, label]) => (
              <div key={label} className="card p-4">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick overview</div>
              <div className="text-xl font-bold text-slate-900">Study Snapshot</div>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">Live</div>
          </div>
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={subject}>
                <div className="mb-1 flex justify-between text-sm text-slate-700">
                  <span>{subject}</span>
                  <span>{70 + index * 6}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-700" style={{ width: `${70 + index * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="page-shell">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">A practical study loop</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['1. Practice', 'Choose a subject and work through realistic JAMB questions with explanations and review.'],
              ['2. Measure', 'Track your performance, weak topics, and average score with each session.'],
              ['3. Improve', 'Use recommendations to revisit weak areas and continue your preparation.'],
            ].map(([title, description]) => (
              <div key={title} className="card p-6">
                <div className="mb-4 text-xl font-bold text-slate-900">{title}</div>
                <p className="text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="practice" className="page-shell py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Practice Mode</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">Study with feedback</h3>
            <p className="mt-4 text-slate-600">
              Review explanations, move between questions, and learn from your mistakes with a structured practice workflow.
            </p>
          </div>
          <div id="simulation" className="card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">CBT Simulation</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">Real exam pressure</h3>
            <p className="mt-4 text-slate-600">
              Experience a timer, question navigation, answer persistence, mark-for-review flow, and final server-side result calculation.
            </p>
          </div>
        </div>
      </section>

      <section id="subjects" className="bg-white py-16">
        <div className="page-shell">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Subjects</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Built for major JAMB subjects</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {subjects.map((subject) => (
              <div key={subject} className="card p-5 text-center">
                <div className="text-lg font-semibold text-slate-900">{subject}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="page-shell py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Common questions</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['Is this an official JAMB platform?', 'No. This is an independent preparation platform inspired by common CBT conventions and designed for student practice.'],
            ['Can I practice without registration?', 'Registration unlocks progress tracking and saved results. It is recommended for a complete experience.'],
            ['Does CBT have a timer?', 'Yes. The real CBT simulation includes a countdown timer, review flow, and secure server-side result calculation.'],
            ['Can I import questions?', 'Yes. Administrators can validate and import JSON or CSV datasets using the admin tools.'],
          ].map(([question, answer]) => (
            <div key={question} className="card p-6">
              <div className="mb-2 font-semibold text-slate-900">{question}</div>
              <p className="text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell flex flex-col gap-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>© 2026 JAMB Prep Platform</div>
          <div>Practice. Measure. Improve.</div>
        </div>
      </footer>
    </main>
  );
}
