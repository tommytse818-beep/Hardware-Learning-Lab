import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { updatePassword } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const { error, message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="access-v1-shell relative overflow-hidden bg-[#05070c] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="access-v1-orb access-v1-orb-one" />
      <div className="relative mx-auto w-full max-w-xl">
        <section className="access-v1-reveal rounded-[2.2rem] bg-white p-6 text-slate-950 shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Secure your account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Choose a new password
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Use the newest reset link from your email. After the update, return to your role dashboard and continue the programme.
          </p>

          <div className="mt-5">
            <StatusBanner error={error} message={message} />
          </div>

          {!configured && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Connect Supabase before testing password updates.
            </div>
          )}

          <form action={updatePassword} className="mt-7 space-y-5">
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                disabled={!configured}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use at least 10 characters and avoid a password shared with classmates.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                disabled={!configured}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={!configured}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save new password
            </button>
          </form>

          <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-slate-600 hover:text-slate-950">
            ← Return to sign in
          </Link>
        </section>
      </div>
    </div>
  );
}
