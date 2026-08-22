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
          This admin workspace will show schools, cohort seats and programme status once a trusted school provision is connected to the live database.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Schools", "Waiting for live data"],
          ["Active cohorts", "Waiting for live data"],
          ["Student seats", "Waiting for live data"],
          ["Pending enrolments", "Waiting for live data"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Provisioning actions</h2>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            Live school, teacher and cohort provisioning will appear here after the trusted admin flow is connected to the database. Until then, this workspace intentionally stays empty rather than showing fictional operational numbers.
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Operational checks</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            <li>• Verify each learner has an individual school-issued account.</li>
            <li>• Confirm temporary passwords are replaced on first login.</li>
            <li>• Review cohort seats and course assignments before distribution.</li>
            <li>• Keep student and teacher emails private and separate from public boards.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
