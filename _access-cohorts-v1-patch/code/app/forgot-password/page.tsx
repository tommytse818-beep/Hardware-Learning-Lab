import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { requestPasswordReset } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="access-v1-shell relative overflow-hidden bg-[#05070c] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="access-v1-orb access-v1-orb-one" />
      <div className="access-v1-orb access-v1-orb-two" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <section className="access-v1-reveal rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-7 backdrop-blur-2xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            School-issued access
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
            Recover your own account securely.
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-300">
            Enter the email address attached to your student, teacher or admin account. Supabase will send a private reset link if that account exists.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-300">
            Each learner must use an individual account. A shared classroom password cannot support private password recovery or reliable progress records.
          </div>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white"
          >
            ← Return to sign in
          </Link>
        </section>

        <section className="access-v1-reveal rounded-[2.2rem] bg-white p-6 text-slate-950 shadow-[0_35px_120px_rgba(0,0,0,0.3)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Forgot password
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Send a reset link
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            For privacy, the confirmation message is the same whether or not an account exists for the address.
          </p>

          <div className="mt-5">
            <StatusBanner error={error} message={message} />
          </div>

          {!configured && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Password email is unavailable until Supabase is configured in <strong>.env.local</strong>.
            </div>
          )}

          <form action={requestPasswordReset} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                Account email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={!configured}
                placeholder="student@school.edu"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={!configured}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Email reset link
            </button>
          </form>

          <p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            No school-issued account yet? Ask your teacher or programme administrator. Accounts are created only after a school programme is confirmed.
          </p>
        </section>
      </div>
    </div>
  );
}
