import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBanner } from "@/components/status-banner";
import { getCourseAccess } from "@/lib/course-access";
import { getPublishedCourseLessons } from "@/lib/course-outline";
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

  if (!viewer?.id || !viewer.verified || viewer.demo) {
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
  const publishedLessons = getPublishedCourseLessons(course);
  const completed = new Set(progress.databaseReady ? progress.records.filter((record) =>
    record.completed === true && (
      !publishedLessons.find((lesson) => lesson.slug === record.lesson_slug)?.humanReviewRequired || record.review_state === "approved"
    ),
  ).map((record) => record.lesson_slug) : []);
  // Later saved flags do not advance progress past an unfinished prerequisite.
  const firstIncomplete = publishedLessons.findIndex((lesson) => !completed.has(lesson.slug));
  const completedCount = firstIncomplete === -1 ? publishedLessons.length : firstIncomplete;
  const percentage = Math.round(
    (completedCount / publishedLessons.length) * 100,
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
            Continue the DrawerSense Mini foundation pathway and build evidence one checkpoint at a time.
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
          Your saved progress could not be confirmed. Open the course panel to retry; later lessons stay locked until your earlier checkpoints can be verified.
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
                {progress.databaseReady ? `${completedCount}/${publishedLessons.length} checkpoints` : access.allowed ? "Temporarily unavailable" : "Course access required"}
              </span>
            </div>
            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
              aria-label={progress.databaseReady ? `${percentage}% complete` : "Progress unavailable"}
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
                    href={`/courses/${course.slug}`}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    {completedCount > 0 ? "Continue course" : "Open course"}
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
                progress.databaseReady ? "Connected" : access.allowed ? "Temporarily unavailable" : "Course access required",
              ],
              ["Section 0 + Week 1", "Published"],
              ["Week 2 · Sections 2.0 and 2.1", "8 activities published"],
              ["Week 2 · Sections 2.2–2.6", "Planned"],
              ["Week 3 · KiCad", "Planned"],
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
