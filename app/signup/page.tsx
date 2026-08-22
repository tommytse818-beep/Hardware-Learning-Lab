import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { signup } from "@/lib/auth-actions";
import { isPublicSignupEnabled, isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SignupPage({
  searchParams,
}: SignupPageProps) {
  const { error, message } = await searchParams;
  const configured = isSupabaseConfigured();
  const signupEnabled = isPublicSignupEnabled();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          School-issued account
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Create a student account
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This open registration form is for prototype testing. School launch
          accounts should later be invite-only and controlled by a teacher or
          administrator.
        </p>

        <div className="mt-5">
          <StatusBanner error={error} message={message} />
        </div>

        {!configured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Connect Supabase in <strong>.env.local</strong> to enable account
            creation.
          </div>
        )}

        {!signupEnabled && configured && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Public registration is currently closed. Ask your school administrator for an invitation.
          </div>
        )}

        <form action={signup} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="displayName"
              className="text-sm font-semibold text-slate-800"
            >
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              disabled={!configured || !signupEnabled}
              placeholder="Tommy"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

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
              disabled={!configured || !signupEnabled}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-800"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={!configured || !signupEnabled}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum 8 characters for this prototype.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-slate-800"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={!configured || !signupEnabled}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={!configured || !signupEnabled}
            className="w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-emerald-700">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}
