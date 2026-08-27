import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
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

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <AuthShell
      eyebrow="Private account recovery"
      title="Recover access without sharing or emailing a password."
      description="Supabase sends a single-use recovery link to the email registered for the individual account."
      sideNote="For privacy, the confirmation is identical whether or not an account exists."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Forgot password</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Send a recovery link</h2>
      <div className="mt-5"><StatusBanner error={error} message={message} /></div>
      <form action={requestPasswordReset} className="mt-7 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-800">Account email</label>
          <input id="email" name="email" type="email" autoComplete="email" required disabled={!configured} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100" />
        </div>
        <button type="submit" disabled={!configured} className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300">
          Email recovery link
        </button>
      </form>
      <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Return to login</Link>
    </AuthShell>
  );
}
