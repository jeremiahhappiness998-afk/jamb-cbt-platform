"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type ProfileStats = {
  examAttemptsCount: number;
  completedExamsCount: number;
  practiceSessionsCount: number;
  totalQuestionsAnswered: number;
  averageAccuracy: number;
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "S"
  );
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profile data.");
        }

        const data: {
          user: UserProfile;
          statistics: ProfileStats;
        } = await response.json();

        setUser(data.user);
        setNameInput(data.user.name);
        setStats(data.statistics);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!nameInput.trim() || saving) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Failed to update profile.");
        return;
      }

      setUser(data.user);
      setIsEditing(false);
      setSaveSuccess("Your name has been updated successfully.");
    } catch {
      setSaveError("An error occurred while saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            ⚠️
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">
            Profile Unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error || "Unable to display profile information."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className="btn btn-primary min-h-11">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
              title="Back to Dashboard"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Candidate Account
              </p>
              <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                Student Profile
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <SignOutButton variant="mobile" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl space-y-8 p-5 sm:p-8">
        {/* Profile Card */}
        <section className="card p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-2 border-emerald-200 bg-emerald-700 text-3xl font-extrabold text-white shadow-soft">
              {getInitials(user.name)}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {user.name}
                </h2>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                  {user.role}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <p className="mt-2 text-xs text-slate-400">
                Registered on {formatDate(user.createdAt)}
              </p>

              {saveSuccess && (
                <div
                  role="status"
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800"
                >
                  ✓ {saveSuccess}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setSaveError("");
                setSaveSuccess("");
              }}
              className="btn btn-secondary min-h-10 px-4 text-xs font-bold"
            >
              {isEditing ? "Cancel" : "Edit Name"}
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-6 border-t border-slate-100 pt-6"
            >
              <div className="max-w-md space-y-3">
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  required
                  minLength={2}
                  maxLength={60}
                />

                {saveError && (
                  <p
                    role="alert"
                    className="text-xs font-semibold text-red-600"
                  >
                    {saveError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary min-h-10 px-5 text-xs font-bold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary min-h-10 px-4 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* Learning Statistics */}
        <section aria-labelledby="stats-heading">
          <div className="mb-4">
            <h2
              id="stats-heading"
              className="text-lg font-extrabold text-slate-900"
            >
              Examination & Learning Record
            </h2>
            <p className="text-xs text-slate-500">
              Verified statistics calculated from actual saved CBT simulations and practice sessions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">
                Completed CBT Exams
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats?.completedExamsCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total attempts: {stats?.examAttemptsCount ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">
                Practice Sessions
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats?.practiceSessionsCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Subject-specific sessions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">
                Questions Tested
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats?.totalQuestionsAnswered ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across submitted examinations
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">
                Average Accuracy
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                {stats?.averageAccuracy ?? 0}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Real calculated percentage
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900">
            Quick Actions
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              href="/simulation"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-bold text-slate-900">Take CBT Exam</p>
                <p className="text-xs text-slate-500">120-minute simulation</p>
              </div>
            </Link>

            <Link
              href="/practice"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-2xl">✎</span>
              <div>
                <p className="text-sm font-bold text-slate-900">Practice Mode</p>
                <p className="text-xs text-slate-500">Custom timing by subject</p>
              </div>
            </Link>

            <Link
              href="/results"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm font-bold text-slate-900">Exam Results</p>
                <p className="text-xs text-slate-500">Review past score breakdowns</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
