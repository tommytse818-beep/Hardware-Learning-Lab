import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  LessonMicroCheckGroup,
  LessonQuiz,
} from "@/components/lesson-quiz";
import { LessonVideo } from "@/components/lesson-video";
import { LessonFormativeCheck } from "@/components/lesson-formative-check";
import { WeekOneFoundationDiagram } from "@/components/course/week-one-foundation-diagram";
import { VerifiedTutor } from "@/components/verified-tutor";
import { getCourseAccess } from "@/lib/course-access";
import { hasActiveCourseResource } from "@/lib/course-resources";
import {
  getAdjacentLessons,
  getCourse,
  getLesson,
  type LessonQuiz as LessonCheckpoint,
} from "@/lib/courses";
import { getLessonAvailability, getRecommendedLessonSlug } from "@/lib/lesson-readiness";
import { getCourseProgress } from "@/lib/progress";
import { getFormativeCheckView } from "@/lib/formative-checks";
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

// Retire misleading circuit artwork and filled answer tables from both the
// teaching page and video placeholder; corrected native examples follow the text.
const retiredDiagramSections = new Set(["0", "1.1", "1.2", "1.4", "1.7", "1.8", "1.9"]);

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

  if (!viewer?.id || !viewer.verified || viewer.demo) {
    redirect(
      `/login?next=/courses/${course.slug}/lessons/${lesson.slug}`,
    );
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
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
  const solvedQuestionIds = new Set(currentProgress?.solved_questions.map((question) => question.questionId) ?? []);
  const currentIndex = course.lessons.findIndex(
    (item) => item.slug === lesson.slug,
  );
  const { previous, next } = getAdjacentLessons(course, lesson.slug);
  const completedLessonSlugs = new Set(
    progress.records
      .filter((record) => record.completed)
      .map((record) => record.lesson_slug),
  );
  const canPreviewAll = viewer.verified && (viewer.role === "admin" || viewer.role === "teacher");
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
  const hasProtectedVideo = lesson.video.resourceKey
    ? await hasActiveCourseResource(course.slug, lesson.video.resourceKey)
    : false;
  const showLegacyDiagram = !retiredDiagramSections.has(lesson.section);
  const separatePullPractice = lesson.section === "1.6";

  const nextHref = next
    ? `/courses/${course.slug}/lessons/${next.slug}`
    : `/courses/${course.slug}`;
  const nextLabel = next
    ? `Continue to ${next.section}`
    : "Return to course overview";

  const checkpointPanel = canPreviewAll ? (
    <TeachingGuide questions={microChecks.length > 0 ? microChecks : [lesson.quiz]} />
  ) : microChecks.length > 0 ? (
    <LessonMicroCheckGroup
      courseSlug={course.slug}
      lessonSlug={lesson.slug}
      checks={microChecks.map((microCheck) => ({
        id: microCheck.id,
        question: microCheck.question,
        options: microCheck.options,
        hint: microCheck.hint,
        incorrectFeedback: microCheck.incorrectFeedback,
        method: solvedQuestionIds.has(microCheck.id) ? microCheck.method : [],
        explanation: solvedQuestionIds.has(microCheck.id) ? microCheck.explanation : "",
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
      initialMethod={currentProgress?.completed ? lesson.quiz.method : undefined}
      initialExplanation={currentProgress?.completed ? lesson.quiz.explanation : undefined}
      cloudConnected={progress.databaseReady}
      nextHref={nextHref}
      nextLabel={nextLabel}
      humanReviewRequired={lesson.humanReviewRequired}
      reviewState={currentProgress?.review_state}
      reviewFeedback={currentProgress?.review_feedback}
    />
  );

  return (
    <div className="lesson-v1 mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
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

      {!progress.databaseReady && (
        <div role="status" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Your saved progress is temporarily unavailable. {canPreviewAll ? "You can still review lesson content." : "Later lessons remain locked until it can be verified."} Reload this page to try again.
        </div>
      )}

      {canPreviewAll && (
        <div role="status" className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
          <strong>Teaching view.</strong> All published lessons and worked answers are available. Browsing this view does not mark a learner checkpoint complete.
        </div>
      )}

      {query.blocked && !canPreviewAll && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          That lesson opens after the previous checkpoint is complete. Continue from this available lesson first.
        </div>
      )}

      <div className="lesson-v1-layout grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
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
                {!hasProtectedVideo && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                    Recording pending
                  </span>
                )}
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
              posterSrc: showLegacyDiagram ? lesson.video.posterSrc : undefined,
              protectedVideoSrc: lesson.video.resourceKey && hasProtectedVideo
                ? `/api/courses/${course.slug}/resources/${lesson.video.resourceKey}`
                : undefined,
            }}
          />

          {separatePullPractice && <p className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm leading-7 text-indigo-950">The 5 V / 100 kΩ image is a standalone pull-up practice example. Those values are separate from the 3 V DrawerSense design; use the values given for each activity.</p>}

          {lesson.diagram && showLegacyDiagram && (
            <figure className="lesson-v1-diagram overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
                    Lesson diagram
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Follow the labelled connections and compare them with your own sketch.
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
                />
              </div>

              <figcaption className="border-t border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600 sm:px-5">
                {separatePullPractice && <strong className="mb-2 block text-indigo-800">Foundation practice example · 5 V / 100 kΩ, separate from the 3 V DrawerSense design.</strong>}
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
                <div key={section.stepId ?? section.heading}>
                  <section>
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
                    <WeekOneFoundationDiagram diagramId={section.diagramId} sectionHeading={section.heading} />
                    {section.formativeCheckIds?.map((checkId) => (
                      <LessonFormativeCheck
                        key={checkId}
                        courseSlug={course.slug}
                        lessonSlug={lesson.slug}
                        check={getFormativeCheckView(checkId, lesson.slug)}
                      />
                    ))}
                  </section>
                  {lesson.checkpointAfterStepId === section.stepId && (
                    <div className="mt-8 space-y-6">
                      {lesson.checkpointTask && (
                        <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm sm:p-8">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
                            Learner action / evidence
                          </p>
                          <p className="mt-3 text-base leading-8 text-cyan-950">
                            {lesson.checkpointTask}
                          </p>
                        </section>
                      )}
                      {checkpointPanel}
                    </div>
                  )}
                </div>
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

          {!lesson.checkpointAfterStepId && checkpointPanel}

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

            {canPreviewAll || currentProgress?.completed ? (
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

      </div>
      <VerifiedTutor lessonTitle={`${lesson.section} · ${lesson.title}`} guidance={lesson.tutor} context={{courseSlug:course.slug,lessonId:lesson.slug,stage:"learn",helpMode:"hint-only"}} />
    </div>
  );
}

// This server component renders answer keys only after verified staff access.
function TeachingGuide({ questions }: { questions: LessonCheckpoint[] }) {
  return (
    <section className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="teaching-guide-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Staff teaching guide</p>
      <h2 id="teaching-guide-title" className="mt-3 text-2xl font-semibold text-slate-950">Questions and worked answers</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Use these methods to support discussion and assess students’ reasoning. Student accounts reveal each method after the required answer.</p>
      <div className="mt-6 space-y-8">
        {questions.map((question, index) => (
          <section key={question.id} className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-950">{index + 1}. {question.question}</h3>
            {question.kind === "choice" ? (
              <ol className="mt-4 space-y-2 text-sm leading-6">
                {question.options.map((option, optionIndex) => (
                  <li key={`${question.id}-${optionIndex}`} className={optionIndex === question.correctIndex ? "rounded-xl bg-emerald-50 px-4 py-3 text-emerald-950" : "px-4 py-2 text-slate-600"}>
                    <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span> {option}{optionIndex === question.correctIndex && <strong className="ml-2">— Correct answer</strong>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
                <strong>Correct answer:</strong> {question.answer} {question.unit}{question.tolerance > 0 && <> (accepted tolerance ±{question.tolerance} {question.unit})</>}
              </p>
            )}
            <h4 className="mt-5 text-sm font-semibold text-slate-950">Worked method</h4>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
              {question.method.map((step, stepIndex) => <li key={`${question.id}-method-${stepIndex}`}>{step}</li>)}
            </ol>
            <p className="mt-4 text-sm leading-7 text-slate-700"><strong>Why this works:</strong> {question.explanation}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
