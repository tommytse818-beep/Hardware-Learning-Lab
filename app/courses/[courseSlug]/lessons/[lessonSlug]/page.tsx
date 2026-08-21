import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonQuiz } from "@/components/lesson-quiz";
import { LessonVideo } from "@/components/lesson-video";
import { VerifiedTutor } from "@/components/verified-tutor";
import {
  getAdjacentLessons,
  getCourse,
  getLesson,
} from "@/lib/courses";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

type LessonPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = getLesson(courseSlug, lessonSlug);

  return {
    title: lesson?.title ?? "Lesson",
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const lesson = getLesson(courseSlug, lessonSlug);

  if (!course || !lesson) {
    notFound();
  }

  const viewer = await getViewer();

  if (!viewer) {
    redirect(
      `/login?next=/courses/${course.slug}/lessons/${lesson.slug}`,
    );
  }

  const progress = await getCourseProgress(viewer.id, course.slug);
  const currentProgress = progress.records.find(
    (record) => record.lesson_slug === lesson.slug,
  );
  const { previous, next } = getAdjacentLessons(course, lesson.slug);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← {course.title}
        </Link>
        <p className="text-sm text-slate-500">
          Lesson {lesson.number} of {course.lessons.length}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)_320px] lg:items-start">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Lessons
          </p>
          <nav className="mt-3 space-y-1" aria-label="Course lessons">
            {course.lessons.map((item) => {
              const active = item.slug === lesson.slug;
              const complete =
                progress.records.find(
                  (record) => record.lesson_slug === item.slug,
                )?.completed ?? false;

              return (
                <Link
                  key={item.slug}
                  href={`/courses/${course.slug}/lessons/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    active
                      ? "bg-slate-950 font-semibold text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                      active
                        ? "bg-white/15 text-white"
                        : complete
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {complete ? "✓" : item.number}
                  </span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                Lesson {lesson.number}
              </span>
              <span>{lesson.duration}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {lesson.summary}
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-950">
                By the end, you should be able to:
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-3">
                    <span className="font-bold text-emerald-700">✓</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <div className="mt-6">
            <LessonVideo
              title={lesson.title}
              embedUrl={lesson.videoEmbedUrl}
            />
          </div>

          <div className="mt-6 space-y-6">
            {lesson.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="font-bold text-indigo-700">→</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                Practical task
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-emerald-950">
                Apply the idea
              </h2>
              <p className="mt-3 leading-7 text-emerald-950">
                {lesson.practicalTask}
              </p>
            </section>

            <LessonQuiz
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              question={lesson.quiz.question}
              options={lesson.quiz.options}
              initialCompleted={currentProgress?.completed ?? false}
              initialScore={currentProgress?.quiz_score ?? null}
              cloudConnected={progress.databaseReady}
            />
          </div>

          <nav
            aria-label="Lesson navigation"
            className="mt-8 grid gap-3 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/courses/${course.slug}/lessons/${previous.slug}`}
                className="rounded-2xl border border-slate-300 bg-white p-4 transition hover:border-slate-950"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Previous
                </span>
                <span className="mt-1 block font-semibold text-slate-950">
                  ← {previous.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/courses/${course.slug}/lessons/${next.slug}`}
                className="rounded-2xl bg-slate-950 p-4 text-white transition hover:bg-slate-800 sm:text-right"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Next
                </span>
                <span className="mt-1 block font-semibold">
                  {next.title} →
                </span>
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug}`}
                className="rounded-2xl bg-emerald-600 p-4 text-white transition hover:bg-emerald-700 sm:text-right"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-emerald-100">
                  Finish
                </span>
                <span className="mt-1 block font-semibold">
                  Return to course overview →
                </span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="lg:sticky lg:top-28">
          <VerifiedTutor
            lessonTitle={lesson.title}
            guidance={lesson.tutor}
          />
        </aside>
      </div>
    </div>
  );
}
