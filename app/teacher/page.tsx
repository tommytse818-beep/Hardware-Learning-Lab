import type { Metadata } from "next";

import { requireViewerRole } from "@/lib/authorization";

export const metadata: Metadata = {
  title: "Teacher portal",
  robots: { index: false, follow: false },
};

export default async function TeacherPage() {
  const viewer = await requireViewerRole(["teacher"]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
          Teacher portal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Cohort overview for {viewer.displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          This workspace will show cohort and learner data once the school programme has been provisioned and linked to your assigned teaching groups.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ["Assigned cohorts", "Waiting for live data"],
          ["Learners in scope", "Waiting for live data"],
          ["Action required", "No live tasks yet"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Teacher status</h2>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          No assignments or cohort data are connected yet. Once your school admin provisions the programme, this page will show the cohorts assigned to you and the learner progress relevant to those groups.
        </div>
      </div>
    </div>
  );
}
