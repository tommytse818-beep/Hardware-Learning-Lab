import "server-only";
import { getCourse, getLesson } from "@/lib/courses";
import { getCourseAccess } from "@/lib/course-access";
import { getCourseProgress } from "@/lib/progress";
import { getLessonAvailability } from "@/lib/lesson-readiness";
import { drawerSenseLessons, getDrawerSenseLesson } from "@/lib/drawersense-curriculum";
import { getDrawerSenseServerProgress } from "@/lib/drawersense-server-progress";
import { hasWork } from "@/lib/drawersense-progress";
import { getWorkedSolution } from "@/lib/drawersense-answer-key";
import type { Viewer } from "@/lib/viewer";
import type { HllTutorAuthorizedContext, HllTutorRequest } from "@/lib/hll-tutor-contract";
import { TutorError } from "./validation";

export async function authorizeTutorContext(viewer: Viewer, target: HllTutorRequest["lesson"]): Promise<HllTutorAuthorizedContext> {
  const course = getCourse(target.courseSlug);
  if (!course || !(await getCourseAccess(viewer, course.slug)).allowed) throw new TutorError("This account does not have course access.", 403);
  const staff = viewer.role === "admin" || viewer.role === "teacher";
  const weekTwo = course.slug === "open-guard-mini" ? getDrawerSenseLesson(target.lessonId) : undefined;
  if (weekTwo) {
    const state = staff ? null : await getDrawerSenseServerProgress(viewer.id);
    if (state && !state.databaseReady) throw new TutorError("Account progress is temporarily unavailable.", 503);
    const index = drawerSenseLessons.findIndex((item) => item.id === weekTwo.id);
    if (state && (!state.weekOneReady || drawerSenseLessons.slice(0, index).some((item) => !state.progress[item.id]?.complete))) throw new TutorError("Complete the earlier lessons before asking about this activity.", 403);
    const work = state?.progress[weekTwo.id];
    const review = staff || Boolean(work && hasWork(work) && weekTwo.questions.every((q) => work.correct.includes(q.id)));
    // No transfer answer key is ever included. Even after review, new tasks need an attempt.
    const teaching = [weekTwo.summary, ...weekTwo.concept, weekTwo.formula ?? "", ...(weekTwo.givens ?? []).map((item) => `${item.label}: ${item.value}`),
      `Practice task: ${weekTwo.drawingTask}`, ...weekTwo.questions.map((q) => `Question: ${q.prompt}. Hint: ${q.hint}`)];
    if (review) teaching.push(...getWorkedSolution(weekTwo.id));
    return { lesson: { ...target, title: weekTwo.title }, stage: review ? "solution" : "practice", helpMode: review ? "worked-review" : "hint-only",
      approvedTeaching: [{ sourceId: `/courses/${course.slug}/week-2?lesson=${weekTwo.id}`, text: teaching.join("\n") }] };
  }
  const lesson = getLesson(course.slug, target.lessonId);
  if (!lesson) throw new TutorError("Choose a published lesson to start chatting.", 404);
  const progress = staff ? null : await getCourseProgress(viewer.id, course.slug);
  if (progress && !progress.databaseReady) throw new TutorError("Account progress is temporarily unavailable.", 503);
  const completed = new Set(progress?.records.filter((item) => item.completed).map((item) => item.lesson_slug));
  if (!getLessonAvailability(course, completed, staff).find((item) => item.lessonSlug === lesson.slug)?.available) throw new TutorError("Complete the earlier lessons first.", 403);
  const review = staff || completed.has(lesson.slug);
  return { lesson: { ...target, title: lesson.title }, stage: review ? "solution" : "learn", helpMode: review ? "worked-review" : "hint-only",
    approvedTeaching: [{ sourceId: `/courses/${course.slug}/lessons/${lesson.slug}`, text:
      [lesson.summary, ...lesson.objectives, ...lesson.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]),
        lesson.practicalTask, lesson.tutor.hint, lesson.tutor.simpleExplanation, lesson.tutor.measurementPrompt].join("\n") }] };
}

export { tutorInstructions } from "./instructions";
