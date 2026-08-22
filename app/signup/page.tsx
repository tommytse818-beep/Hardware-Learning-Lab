import type { Metadata } from "next";
import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "School access",
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          School-issued access
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Registration is by invitation only.
        </h1>

        <div className="mt-5">
          <StatusBanner error={error} message={message} />
        </div>

        {!configured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Supabase is not configured yet. School accounts are created by the
            administrator after a verified school purchase.
          </div>
        )}

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          <p>
            There is no public sign-up flow for this platform. Each learner
            receives a separate school-issued account and a unique temporary
            password.
          </p>
          <p>
            Schools contact the programme team through the public enquiry form,
            receive a quotation, and then an administrator provisions the cohort
            and learner accounts. Teachers and administrators are managed by the
            verified school workflow.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Go to login
          </Link>
          <Link
            href="/schools"
            className="inline-flex justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-slate-950"
          >
            Request a school quotation
          </Link>
        </div>
      </section>
    </div>
  );
}
