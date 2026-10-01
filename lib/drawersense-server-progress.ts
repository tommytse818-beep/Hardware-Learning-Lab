import "server-only";

import { getCourse } from "@/lib/courses";
import { drawerSenseLessons, getDrawerSenseLesson, type LessonId } from "@/lib/drawersense-curriculum";
import { emptyLessonWork, sanitizeProgress, type PathwayProgress } from "@/lib/drawersense-progress";
import { getCourseProgress, type CourseProgressResult } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const DRAWERSENSE_WORK_STEP = "saved-working";
export const DRAWERSENSE_REVIEW_STEP = "solution-comparison";
const courseSlug = "open-guard-mini";

export type DrawerSenseServerProgress = {
  databaseReady: boolean;
  weekOneReady: boolean;
  blockedBy: string | null;
  progress: PathwayProgress;
};

export function drawerSenseLessonSlug(lessonId: LessonId) {
  return `drawer-${lessonId.toLowerCase().replace(".", "-")}`;
}

export function drawerSenseRequiredSteps(lessonId: LessonId) {
  const lesson = getDrawerSenseLesson(lessonId);
  if (!lesson) throw new Error("Unknown DrawerSense activity.");
  return [...lesson.questions.map((question) => question.id), DRAWERSENSE_WORK_STEP, DRAWERSENSE_REVIEW_STEP, lesson.transfer.id];
}

const unavailable = (): DrawerSenseServerProgress => ({ databaseReady: false, weekOneReady: false, blockedBy: null, progress: {} });

/** The caller supplies the verified account ID; RLS also scopes the read to that account. */
export async function getDrawerSenseServerProgress(userId: string | null, suppliedCourseProgress?: CourseProgressResult): Promise<DrawerSenseServerProgress> {
  if (!userId) return unavailable();
  try {
    const course = getCourse(courseSlug);
    const courseProgress = suppliedCourseProgress ?? await getCourseProgress(userId, courseSlug);
    if (!course || !courseProgress.databaseReady) return unavailable();

    const priorLessons = course.lessons.filter((lesson) => lesson.section === "0" || /^1(?:\.|$)/.test(lesson.section));
    const blocked = priorLessons.find((lesson) => {
      const record = courseProgress.records.find((item) => item.lesson_slug === lesson.slug);
      return !record?.completed || (lesson.humanReviewRequired && record.review_state !== "approved");
    });
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("lesson_slug, question_id, submitted_answer, created_at")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .eq("correct", true)
      .in("lesson_slug", drawerSenseLessons.map((lesson) => drawerSenseLessonSlug(lesson.id)))
      .abortSignal(AbortSignal.timeout(10_000))
      .order("created_at", { ascending: false });
    if (error) return unavailable();

    const progress: PathwayProgress = {};
    for (const lesson of drawerSenseLessons) {
      const slug = drawerSenseLessonSlug(lesson.id);
      const record = courseProgress.records.find((item) => item.lesson_slug === slug);
      const attempts = (data ?? []).filter((attempt) => attempt.lesson_slug === slug);
      if (!record && !attempts.length) continue;
      const savedWork = attempts.find((attempt) => attempt.question_id === DRAWERSENSE_WORK_STEP)?.submitted_answer;
      const work = sanitizeProgress({ [lesson.id]: savedWork })[lesson.id] ?? emptyLessonWork();
      const solved = new Set(record?.solved_questions.map((question) => question.questionId) ?? []);
      work.answers = {};
      for (const question of lesson.questions) {
        const answer = attempts.find((attempt) => attempt.question_id === question.id)?.submitted_answer;
        const parsed = sanitizeProgress({ [lesson.id]: { answers: { [question.id]: answer } } })[lesson.id];
        if (parsed?.answers[question.id] !== undefined) work.answers[question.id] = parsed.answers[question.id];
      }
      const transfer = attempts.find((attempt) => attempt.question_id === lesson.transfer.id)?.submitted_answer;
      work.transfer = sanitizeProgress({ [lesson.id]: { transfer } })[lesson.id]?.transfer;
      work.correct = lesson.questions.filter((question) => solved.has(question.id)).map((question) => question.id);
      work.saved = solved.has(DRAWERSENSE_WORK_STEP);
      work.reviewed = solved.has(DRAWERSENSE_REVIEW_STEP);
      work.onlineReady = drawerSenseRequiredSteps(lesson.id).every((step) => solved.has(step));
      work.complete = record?.completed === true && (lesson.id !== "2.1F" || record.review_state === "approved");
      // Old browser-only receipts and flags never become authoritative account state.
      delete work.override;
      delete work.overrideReason;
      progress[lesson.id] = work;
    }
    return { databaseReady: true, weekOneReady: priorLessons.length > 0 && !blocked, blockedBy: blocked?.slug ?? null, progress };
  } catch {
    return unavailable();
  }
}

/** Server-graded events reuse the existing transactional, service-role-only RPC. */
export async function recordDrawerSenseStep(
  userId: string,
  lessonId: LessonId,
  questionId: string,
  submittedAnswer: unknown,
  correct: boolean,
) {
  const requiredSteps = drawerSenseRequiredSteps(lessonId);
  if (!userId || !requiredSteps.includes(questionId)) throw new Error("Invalid activity record.");
  const { data, error } = await createAdminClient().rpc("record_quiz_attempt_v2", {
    p_user_id: userId,
    p_course_slug: courseSlug,
    p_lesson_slug: drawerSenseLessonSlug(lessonId),
    p_question_id: questionId,
    p_required_question_ids: requiredSteps,
    p_human_review_required: lessonId === "2.1F",
    p_submitted_answer: submittedAnswer,
    p_correct: correct,
  }).abortSignal(AbortSignal.timeout(10_000));
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row || row.correct !== correct) throw new Error("Your activity could not be saved to your account. Try again before continuing.");
  return { completed: row.completed === true, onlineReady: row.online_ready === true, reviewState: String(row.review_state ?? "not_started") };
}
