import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="mx-auto max-w-5xl">
        <div className="card p-8 text-center sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            JAMB CBT Preparation
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Prepare for JAMB with confidence.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Practice JAMB-style questions, take CBT simulations,
            track your performance, and improve your preparation.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="btn btn-primary min-h-12 px-6"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="btn min-h-12 border border-slate-300 bg-white px-6"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}