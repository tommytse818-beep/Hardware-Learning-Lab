import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { login } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error, message, next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          Student access
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Continue your hardware project.
        </h1>
        <p className="mt-4 leading-7 text-slate-300">
          Sign in to keep lesson progress and quiz results linked to your
          account. School accounts will later use teacher-controlled invites.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold">School-issued access</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            The rest of the website works in demo mode. Connect Supabase using
            README.md before testing real registration and reset emails.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Log in</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the email and password registered with the platform.
        </p>

        <div className="mt-5">
          <StatusBanner error={error} message={message} />
        </div>

        {!configured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Account forms are disabled until the Supabase URL and publishable
            key are added to <strong>.env.local</strong>.
          </div>
        )}

        <form action={login} className="mt-6 space-y-5">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-800"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={!configured}
              placeholder="student@example.com"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-800"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          School-issued access only. Ask your school administrator for the
          correct account details.
        </p>
      </section>
    </div>
  );
}
