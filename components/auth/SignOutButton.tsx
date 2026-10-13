"use client";

import { useState } from "react";

export function SignOutButton({
  className = "",
  variant = "desktop",
}: {
  className?: string;
  variant?: "desktop" | "mobile";
}) {
  const [loading, setLoading] = useState(false);

  async function handleLogout(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Sign out returned non-OK status:", response.status);
      }

      // Hard navigation to /login to ensure all client and server caches are cleared
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect to /login
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={
          className ||
          "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <span className="text-base" aria-hidden="true">
        ⎋
      </span>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
