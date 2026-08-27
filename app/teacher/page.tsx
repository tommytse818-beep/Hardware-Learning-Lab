import type { Metadata } from "next";

import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { requireViewerRole } from "@/lib/authorization";
import { getTeacherPortalData } from "@/lib/portal-data";

export const metadata: Metadata = {
  title: "Teacher portal",
  robots: { index: false, follow: false },
};

export default async function TeacherPage() {
  const viewer = await requireViewerRole(["teacher"]);
  const data = await getTeacherPortalData(viewer.id!);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[2.2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Assigned teaching workspace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">See only the learners you are responsible for.</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-300">Welcome, {viewer.displayName}. Set a class target, review real checkpoint evidence and send a private catch-up reminder without mentioning rank.</p>
      </section>
      <TeacherDashboard metrics={data.metrics} cohorts={data.cohorts} />
    </div>
  );
}
