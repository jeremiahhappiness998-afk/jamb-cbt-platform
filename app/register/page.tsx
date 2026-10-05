export default function RegisterPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-slate-900">Create account</div>
          <p className="mt-2 text-sm text-slate-600">Start preparing for JAMB with structured practice</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input className="w-full rounded-lg border border-slate-300 p-3" type="text" placeholder="John Doe" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="w-full rounded-lg border border-slate-300 p-3" type="email" placeholder="student@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input className="w-full rounded-lg border border-slate-300 p-3" type="password" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary w-full" type="submit">Register</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <a href="/login" className="font-semibold text-emerald-700">Login</a>
        </div>
      </div>
    </main>
  );
}
