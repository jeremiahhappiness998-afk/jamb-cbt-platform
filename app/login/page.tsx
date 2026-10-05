export default function LoginPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-slate-900">Login</div>
          <p className="mt-2 text-sm text-slate-600">Access your dashboard and preparation progress</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="w-full rounded-lg border border-slate-300 p-3" type="email" placeholder="student@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input className="w-full rounded-lg border border-slate-300 p-3" type="password" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary w-full" type="submit">Login</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600">
          No account? <a href="/register" className="font-semibold text-emerald-700">Create one</a>
        </div>
      </div>
    </main>
  );
}
