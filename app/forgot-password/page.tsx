import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { requestPasswordReset } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Forgot password",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
          Account recovery
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter your account email. The system returns the same confirmation
          message whether or not the address exists.
        </p>

        <div className="mt-5">
          <StatusBanner error={error} message={message} />
        </div>

        {!configured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Automatic email is disabled until Supabase is connected.
          </div>
        )}

        <form action={requestPasswordReset} className="mt-6 space-y-5">
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
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send reset email
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-indigo-700">
            Return to login
          </Link>
        </p>
      </section>
    </div>
  );
}
