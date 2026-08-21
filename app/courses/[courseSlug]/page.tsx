import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCourse } from "@/lib/courses";
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

  const progress = await getCourseProgress(viewer.id, course.slug);
  const progressByLesson = new Map(
    progress.records.map((record) => [record.lesson_slug, record]),
  );
  const completedCount = progress.records.filter(
    (record) => record.completed,
  ).length;
  const percentage = Math.round(
    (completedCount / course.lessons.length) * 100,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        ← Dashboard
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl bg-slate-950 text-white">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              {course.level}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">
              {course.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
              {[course.ageRange, course.duration].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-52 rounded-2xl bg-white/10 p-5">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <strong>{percentage}%</strong>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Course sequence
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Build understanding layer by layer.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            Outcome: {course.outcome}
          </p>
        </div>

        <div className="mt-7 space-y-4">
          {course.lessons.map((lesson) => {
            const lessonProgress = progressByLesson.get(lesson.slug);
            const complete = lessonProgress?.completed ?? false;

            return (
              <Link
                key={lesson.slug}
                href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl font-bold ${
                    complete
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {complete ? "✓" : lesson.number}
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">
                    {lesson.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {lesson.summary}
                  </span>
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {lesson.duration} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
