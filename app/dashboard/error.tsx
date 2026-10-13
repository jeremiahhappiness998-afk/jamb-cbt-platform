"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
          ⚠️
        </div>

        <h1 className="mt-4 text-xl font-extrabold text-slate-900">
          Unable to load dashboard
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          We encountered an issue while loading your student dashboard. Please try
          again or check your connection.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary min-h-11"
          >
            Try again
          </button>

          <Link href="/login" className="btn btn-secondary min-h-11">
            Re-login
          </Link>
        </div>
      </div>
    </div>
  );
}
