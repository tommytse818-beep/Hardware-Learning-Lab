import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { StatusBanner } from "@/components/status-banner";

export const metadata: Metadata = {
  title: "School access",
  robots: { index: false, follow: false },
};

type SignupPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, message } = await searchParams;

  return (
    <AuthShell
      eyebrow="Invitation only"
      title="Every learner receives an individual account."
      description="Schools confirm the programme first. An administrator then provisions the cohort, course access and one private account per learner."
      sideNote="A teacher account is separate and never consumes a student seat."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">School-issued access</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">No public registration</h2>
      <div className="mt-5"><StatusBanner error={error} message={message} /></div>
      <div className="mt-7 space-y-4">
        {[
          "The school requests a quotation and confirms the programme.",
          "An administrator creates the school, cohort and purchased course assignment.",
          "Each learner receives their own email account and unique temporary password.",
          "The temporary password must be replaced at first login.",
          "Later recovery uses a secure Supabase reset link sent to the registered email.",
        ].map((item, index) => (
          <div key={item} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">0{index + 1}</span>
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800">Go to login</Link>
        <Link href="/schools" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-5 font-semibold text-slate-800 hover:border-slate-950">Request a quotation</Link>
      </div>
    </AuthShell>
  );
}
