import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCourseAccess } from "@/lib/course-access";
import { getCourse, type Lesson } from "@/lib/courses";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

type CoursePageProps = {
  params: Promise<{
    courseSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);

  return {
    title: course?.title ?? "Course",
    robots: { index: false, follow: false },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  const viewer = await getViewer();

  if (!viewer) {
    redirect(`/login?next=/courses/${course.slug}`);
  }

  const access = await getCourseAccess(viewer, course.slug);

  const progress = await getCourseProgress(viewer.id, course.slug);
  const progressByLesson = new Map(
    progress.records.map((record) => [record.lesson_slug, record]),
  );
  const completedCount = course.lessons.filter(
    (lesson) => progressByLesson.get(lesson.slug)?.completed,
  ).length;
  const percentage = Math.round(
    (completedCount / course.lessons.length) * 100,
  );

  const courseLessons = course.lessons;
  const canonicalCourseSlug = course.slug;
  const sectionZero = courseLessons.filter((lesson) => lesson.section === "0");
  const sectionOne = courseLessons.filter((lesson) => lesson.section.startsWith("1."));

  function lessonCard(lesson: Lesson) {
    const complete = progressByLesson.get(lesson.slug)?.completed ?? false;
    const unlocked = access.allowed;

    const content = (
      <>
        <span
          className={`grid h-12 min-w-12 place-items-center rounded-xl text-sm font-bold ${
            complete
              ? "bg-emerald-100 text-emerald-800"
              : unlocked
                ? "bg-slate-100 text-slate-700"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {complete ? "✓" : lesson.section}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-950">{lesson.title}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">
              {lesson.delivery}
            </span>
            {lesson.humanReviewRequired && (
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-violet-700">
                Human review
              </span>
            )}
          </span>
          <span className="mt-1.5 block text-sm leading-6 text-slate-600">
            {lesson.summary}
          </span>
        </span>
        <span className="text-sm font-semibold text-slate-500">
          {unlocked ? `${lesson.duration} →` : "Locked"}
        </span>
      </>
    );

    if (!unlocked) {
      return (
        <div
          key={lesson.slug}
          aria-disabled="true"
          className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 opacity-75 sm:grid-cols-[auto_1fr_auto] sm:items-center"
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={lesson.slug}
        href={`/courses/${canonicalCourseSlug}/lessons/${lesson.slug}`}
        className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← Dashboard
        </Link>
        <Link
          href={course.projectHref}
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Public project page →
        </Link>
      </div>

      <section className="course-v1-hero mt-6 overflow-hidden rounded-[2.2rem] bg-slate-950 text-white shadow-xl">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_17rem] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.15em]">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
                {course.theme}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-300">
                {course.status}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              {course.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
              {[course.level, course.ageRange, course.duration].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <strong>{percentage}%</strong>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-300">
              {completedCount} of {course.lessons.length} checkpoints complete
            </p>
          </div>
        </div>
      </section>

      {!access.allowed && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          A verified Supabase account is required to enter the course. Sign in and confirm your email address before starting Section 0.
        </div>
      )}

      {access.state === "setup-required" && (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-950">
          {access.message}
        </div>
      )}

      <section className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Learning outcome for this patch
        </p>
        <p className="mt-3 max-w-4xl text-lg leading-8 text-blue-950">
          {course.outcome}
        </p>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Section 0
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Induction before independent learning.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Learners who missed the live induction are directed to ask their teacher for the approved recording before Section 1 unlocks.
          </p>
        </div>
        <div className="mt-6 space-y-4">{sectionZero.map(lessonCard)}</div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Section 1
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              One concept, one question, one clear next step.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Lessons 1.1-1.8 are pre-recorded micro-lessons. Section 1.9 is the live Week 1 design checkpoint and remains human-approved.
          </p>
        </div>
        <div className="mt-6 space-y-4">{sectionOne.map(lessonCard)}</div>
      </section>
    </div>
  );
}
