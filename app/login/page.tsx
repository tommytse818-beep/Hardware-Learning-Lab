import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { StatusBanner } from "@/components/status-banner";
import { login } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <AuthShell
      eyebrow="School-issued access"
      title="Continue the product you are learning to understand."
      description="Your individual account keeps course access, checkpoint evidence and profile settings private."
      sideNote="There is no public student registration and no shared classroom password."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Account access</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Log in</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Use the email and password issued for your programme account.</p>

      <div className="mt-5"><StatusBanner error={error} message={message} /></div>

      {!configured && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Account access is not configured on this local copy. Add the existing Supabase project settings to <strong>.env.local</strong>.
        </div>
      )}

      <form action={login} className="mt-7 space-y-5">
        <input type="hidden" name="next" value={next ?? ""} />
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-800">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required disabled={!configured} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100" />
        </div>
        <PasswordField label="Password" name="password" autoComplete="current-password" required disabled={!configured} />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">Forgot password?</Link>
        </div>
        <button type="submit" disabled={!configured} className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 motion-reduce:transform-none">
          Log in
        </button>
      </form>

      <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
        Need an account? <Link href="/signup" className="font-semibold text-emerald-700">Read how school access works</Link>.
      </p>
    </AuthShell>
  );
}
