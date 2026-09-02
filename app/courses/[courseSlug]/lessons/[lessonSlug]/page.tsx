import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  LessonMicroCheckGroup,
  LessonQuiz,
} from "@/components/lesson-quiz";
import { LessonVideo } from "@/components/lesson-video";
import { VerifiedTutor } from "@/components/verified-tutor";
import { getCourseAccess } from "@/lib/course-access";
import {
  getAdjacentLessons,
  getCourse,
  getLesson,
} from "@/lib/courses";
import { getLessonAvailability, getRecommendedLessonSlug } from "@/lib/lesson-readiness";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

type LessonPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonSlug: string;
  }>;
  searchParams?: Promise<{
    blocked?: string;
  }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = getLesson(courseSlug, lessonSlug);

  return {
    title: lesson?.title ?? "Lesson",
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const query = searchParams ? await searchParams : {};
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

  const access = await getCourseAccess(viewer, course.slug);

  if (!access.allowed) {
    redirect(`/courses/${course.slug}`);
  }

  const progress = await getCourseProgress(viewer.id, course.slug);
  const progressByLesson = new Map(
    progress.records.map((record) => [record.lesson_slug, record]),
  );
  const currentProgress = progressByLesson.get(lesson.slug);
  const currentIndex = course.lessons.findIndex(
    (item) => item.slug === lesson.slug,
  );
  const { previous, next } = getAdjacentLessons(course, lesson.slug);
  const completedLessonSlugs = new Set(
    progress.records
      .filter((record) => record.completed)
      .map((record) => record.lesson_slug),
  );
  const canPreviewAll = access.allowed && viewer.role !== "student";
  const availability = getLessonAvailability(
    course,
    completedLessonSlugs,
    canPreviewAll,
  );
  const availabilityByLesson = new Map(
    availability.map((item) => [item.lessonSlug, item]),
  );

  if (!(availabilityByLesson.get(lesson.slug)?.available ?? false)) {
    const recommendedLessonSlug = getRecommendedLessonSlug(course, completedLessonSlugs);
    redirect(
      recommendedLessonSlug
        ? `/courses/${course.slug}/lessons/${recommendedLessonSlug}?blocked=${lesson.slug}`
        : `/courses/${course.slug}?blocked=${lesson.slug}`,
    );
  }

  const quizView =
    lesson.quiz.kind === "choice"
      ? {
          kind: "choice" as const,
          question: lesson.quiz.question,
          options: lesson.quiz.options,
        }
      : {
          kind: "numeric" as const,
          question: lesson.quiz.question,
          unit: lesson.quiz.unit,
          placeholder: lesson.quiz.placeholder,
        };

  const microChecks = lesson.microChecks ?? [];

  const nextHref = next
    ? `/courses/${course.slug}/lessons/${next.slug}`
    : `/courses/${course.slug}`;
  const nextLabel = next
    ? `Continue to ${next.section}`
    : "Return to course overview";

  return (
    <div className="lesson-v1 mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← {course.shortTitle}
        </Link>
        <p className="text-sm text-slate-500">
          Checkpoint {currentIndex + 1} of {course.lessons.length}
        </p>
      </div>

      {query.blocked && !canPreviewAll && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          That lesson opens after the previous checkpoint is complete. Continue from this available lesson first.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_320px] lg:items-start">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Section 0 + Week 1
          </p>
          <nav className="mt-3 space-y-1" aria-label="Course lessons">
            {course.lessons.map((item) => {
              const active = item.slug === lesson.slug;
              const complete =
                progressByLesson.get(item.slug)?.completed ?? false;
              const itemUnlocked = access.allowed && (availabilityByLesson.get(item.slug)?.available ?? false);

              const classes = `flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active
                  ? "bg-slate-950 font-semibold text-white"
                  : itemUnlocked
                    ? "text-slate-700 hover:bg-slate-100"
                    : "cursor-not-allowed text-slate-400"
              }`;

              const content = (
                <>
                  <span
                    className={`grid h-8 min-w-8 shrink-0 place-items-center rounded-lg text-[0.68rem] font-bold ${
                      active
                        ? "bg-white/15 text-white"
                        : complete
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {complete ? "✓" : item.section}
                  </span>
                  <span className="min-w-0 leading-5">{item.title}</span>
                </>
              );

              if (!itemUnlocked) {
                return (
                  <span key={item.slug} aria-disabled="true" className={classes}>
                    {content}
                  </span>
                );
              }

              return (
                <Link
                  key={item.slug}
                  href={`/courses/${course.slug}/lessons/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={classes}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </aside>

        <article className="min-w-0 space-y-6">
          <header className="lesson-v1-header overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  Section {lesson.section}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {lesson.delivery}
                </span>
                <span>{lesson.duration}</span>
                {lesson.humanReviewRequired && (
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">
                    Human review required
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
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
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <LessonVideo
            title={lesson.title}
            video={{
              ...lesson.video,
              protectedVideoSrc: lesson.video.resourceKey
                ? `/api/courses/${course.slug}/resources/${lesson.video.resourceKey}`
                : undefined,
            }}
          />

          {lesson.diagram && (
            <figure className="lesson-v1-diagram overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
                    Lesson diagram
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Original aspect ratio {lesson.diagram.width}:{lesson.diagram.height}; no stretching or motion.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5">
                <Image
                  src={lesson.diagram.src}
                  alt={lesson.diagram.alt}
                  width={lesson.diagram.width}
                  height={lesson.diagram.height}
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="h-auto max-w-full rounded-2xl border border-slate-200 bg-white object-contain"
                  priority={false}
                />
              </div>

              <figcaption className="border-t border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600 sm:px-5">
                {lesson.diagram.caption}
              </figcaption>
            </figure>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Lesson explanation
            </p>
            <div className="mt-6 space-y-8">
              {lesson.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-base leading-8 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && (
                    <ul className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
              Learner action / evidence
            </p>
            <p className="mt-3 text-base leading-8 text-cyan-950">
              {lesson.practicalTask}
            </p>
          </section>

          {microChecks.length > 0 ? (
            <LessonMicroCheckGroup
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              checks={microChecks.map((microCheck) => ({
                id: microCheck.id,
                question: microCheck.question,
                options: microCheck.options,
                hint: microCheck.hint,
                incorrectFeedback: microCheck.incorrectFeedback,
                method: microCheck.method,
                explanation: microCheck.explanation,
              }))}
              nextHref={nextHref}
              nextLabel={nextLabel}
              cloudConnected={progress.databaseReady}
              initialSolvedQuestions={currentProgress?.solved_questions ?? []}
            />
          ) : (
            <LessonQuiz
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              quiz={quizView}
              questionId={lesson.quiz.id}
              initialCompleted={currentProgress?.completed ?? false}
              initialScore={currentProgress?.quiz_score ?? null}
              initialMethod={
                currentProgress?.completed ? lesson.quiz.method : undefined
              }
              initialExplanation={
                currentProgress?.completed ? lesson.quiz.explanation : undefined
              }
              cloudConnected={progress.databaseReady}
              nextHref={nextHref}
              nextLabel={nextLabel}
              humanReviewRequired={lesson.humanReviewRequired}
              reviewState={currentProgress?.review_state}
              reviewFeedback={currentProgress?.review_feedback}
            />
          )}

          <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
            {previous ? (
              <Link
                href={`/courses/${course.slug}/lessons/${previous.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm transition hover:border-slate-400"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Previous
                </span>
                <span className="mt-1 block font-semibold">
                  ← {previous.section} {previous.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {currentProgress?.completed ? (
              <Link
                href={nextHref}
                className="rounded-2xl bg-slate-950 p-4 text-white transition hover:bg-slate-800 sm:text-right"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                  {next ? "Next" : "Finish"}
                </span>
                <span className="mt-1 block font-semibold">
                  {nextLabel} →
                </span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500 sm:text-right">
                Answer the checkpoint correctly to reveal the method and unlock the next lesson.
              </div>
            )}
          </nav>
        </article>

        <aside className="lg:sticky lg:top-28">
          <VerifiedTutor lessonTitle={lesson.title} guidance={lesson.tutor} />
        </aside>
      </div>
    </div>
  );
}
