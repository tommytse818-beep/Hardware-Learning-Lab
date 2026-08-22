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
          Review learner progress, points, aliases and behind/on-track status for only the cohorts assigned to your teaching group.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ["Assigned learners", "18"],
          ["Behind target", "4"],
          ["Average points", "612"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Learner status</h2>
        <div className="mt-5 space-y-3">
          {[
            ["Ava", "On track", "1,180 points"],
            ["Milo", "Behind target", "640 points"],
            ["Nina", "On track", "1,040 points"],
          ].map(([name, status, points]) => (
            <div key={name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-slate-500">Alias privacy protected</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{points}</p>
                <p className={status === "Behind target" ? "text-amber-700" : "text-emerald-700"}>{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
