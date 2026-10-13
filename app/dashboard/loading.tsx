export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 md:flex">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-emerald-100" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </aside>

        {/* Main skeleton */}
        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
            <div className="space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-emerald-100" />
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            {/* Banner skeleton */}
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />

            {/* Stats skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>

            {/* Subjects skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
