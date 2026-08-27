import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBanner } from "@/components/status-banner";
import { getCourseAccess } from "@/lib/course-access";
import { getCourse } from "@/lib/courses";
import { isSupabaseConfigured } from "@/lib/env";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { error, message } = await searchParams;
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
  }

  if (viewer.role === "admin") {
    redirect("/admin");
  }

  if (viewer.role === "teacher") {
    redirect("/teacher");
  }

  const course = getCourse("open-guard-mini");

  if (!course) {
    return null;
  }

  const access = await getCourseAccess(viewer, course.slug);
  const progress = access.allowed
    ? await getCourseProgress(viewer.id, course.slug)
    : { records: [], databaseReady: false };
  const completedCount = course.lessons.filter((lesson) =>
    progress.records.some(
      (record) => record.lesson_slug === lesson.slug && record.completed,
    ),
  ).length;
  const percentage = Math.round(
    (completedCount / course.lessons.length) * 100,
  );
  const supabaseConnected = isSupabaseConfigured();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <StatusBanner error={error} message={message} />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Student dashboard
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Welcome, {viewer.displayName}.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Continue the OpenGuard Mini foundation pathway and build evidence one checkpoint at a time.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold text-slate-900">{viewer.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            Authenticated student
          </p>
        </div>
      </div>

      {!access.allowed && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950">
          <strong>Course access is not active.</strong> {access.message}
        </div>
      )}

      {access.allowed && !progress.databaseReady && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          Your verified account has course access. Progress sync is temporarily unavailable, but you can still review the course lessons.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Current pathway
              </p>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-200">
                {course.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold">{course.title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              {course.description}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">
                Course progress
              </span>
              <span className="text-slate-500">
                {completedCount}/{course.lessons.length} checkpoints
              </span>
            </div>
            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
              aria-label={`${percentage}% complete`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {access.allowed ? (
                <>
                  <Link
                    href={`/courses/${course.slug}/lessons/${course.lessons[0].slug}`}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    {completedCount > 0 ? "Continue course" : "Start Section 0"}
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-950"
                  >
                    View all checkpoints
                  </Link>
                </>
              ) : (
                <Link
                  href={course.projectHref}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open public project preview
                </Link>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Learning access status
          </p>
          <dl className="mt-5 space-y-4">
            {[
              ["Public project experience", "Ready"],
              [
                "Email/password accounts",
                supabaseConnected ? "Connected" : "Not configured",
              ],
              [
                "Course entitlement",
                access.allowed ? access.state : "Seat required",
              ],
              [
                "Cloud lesson progress",
                progress.databaseReady ? "Connected" : "Setup needed",
              ],
              ["Section 0 + Week 1", "Working"],
              ["Week 2 and Week 3", "Planned next"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0"
              >
                <dt className="text-slate-600">{label}</dt>
                <dd className="text-right font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
