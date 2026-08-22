import type { Metadata } from "next";

import { requireViewerRole } from "@/lib/authorization";

export const metadata: Metadata = {
  title: "Admin portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const viewer = await requireViewerRole(["admin"]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Admin portal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Welcome, {viewer.displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Manage provisioned schools, teacher accounts, cohort seats and course assignments after a verified school purchase.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Schools", "3"],
          ["Active cohorts", "6"],
          ["Student seats", "72/72"],
          ["Pending enrolments", "4"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Provisioning actions</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            <li>• Create schools and validate the confirmed commercial agreement.</li>
            <li>• Set cohort seat limits and assign the purchased course.</li>
            <li>• Batch import student accounts from Name,email lines.</li>
            <li>• Allocate teacher accounts without consuming student seats.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Operational checks</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            <li>• Verify each learner has an individual school-issued account.</li>
            <li>• Confirm temporary passwords are replaced on first login.</li>
            <li>• Review the cohort leaderboard and progress status before distribution.</li>
            <li>• Keep student and teacher emails private and separate from public boards.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
