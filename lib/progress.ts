import { isSupabaseConfigured } from "@/lib/env";
import type { LessonReviewState } from "@/lib/lesson-readiness";
import { createClient } from "@/lib/supabase/server";
import { getCourse } from "./courses";

export type SolvedQuestionRecord = {
  questionId: string;
  score: number;
};

export type LessonProgressRecord = {
  lesson_slug: string;
  completed: boolean;
  quiz_score: number | null;
  review_state: LessonReviewState;
  review_feedback: string | null;
  reviewed_at: string | null;
  solved_questions: SolvedQuestionRecord[];
};

export type CourseProgressResult = {
  records: LessonProgressRecord[];
  databaseReady: boolean;
};

export async function getCourseProgress(
  userId: string | null,
  courseSlug: string,
): Promise<CourseProgressResult> {
  if (!isSupabaseConfigured()) {
    return {
      records: [],
      databaseReady: false,
    };
  }

  if (!userId) {
    return {
      records: [],
      databaseReady: false,
    };
  }

  try {
    const supabase = await createClient();
    const signal = AbortSignal.timeout(10_000);
    const [progressResult, attemptsResult] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_slug, completed, quiz_score, review_state, review_feedback, reviewed_at")
        .eq("user_id", userId)
        .eq("course_slug", courseSlug)
        .abortSignal(signal),
      supabase
        .from("quiz_attempts")
        .select("lesson_slug, question_id, points_awarded, attempt_number")
        .eq("user_id", userId)
        .eq("course_slug", courseSlug)
        .eq("correct", true)
        .order("attempt_number", { ascending: true })
        .abortSignal(signal),
    ]);

    if (progressResult.error || attemptsResult.error || !Array.isArray(progressResult.data) || !Array.isArray(attemptsResult.data)) {
      return {
        records: [],
        databaseReady: false,
      };
    }

    const solvedByLesson = new Map<string, SolvedQuestionRecord[]>();

    for (const attempt of attemptsResult.data ?? []) {
      if (!attempt || typeof attempt.lesson_slug !== "string" || typeof attempt.question_id !== "string") continue;
      const solved = solvedByLesson.get(attempt.lesson_slug) ?? [];
      if (!solved.some((item) => item.questionId === attempt.question_id)) {
        solved.push({
          questionId: attempt.question_id,
          score: typeof attempt.points_awarded === "number" && Number.isFinite(attempt.points_awarded) ? attempt.points_awarded : 0,
        });
        solvedByLesson.set(attempt.lesson_slug, solved);
      }
    }

    const humanReviewedLessons = new Set(getCourse(courseSlug)?.lessons.filter((lesson) => lesson.humanReviewRequired).map((lesson) => lesson.slug) ?? []);
    return {
      records: progressResult.data.filter((record) => record && typeof record.lesson_slug === "string").map((record) => ({
        lesson_slug: record.lesson_slug,
        completed: record.completed === true && (humanReviewedLessons.has(record.lesson_slug)
          ? record.review_state === "approved"
          : record.review_state !== "awaiting_review" && record.review_state !== "revision_requested"),
        quiz_score: record.quiz_score,
        review_state: (record.review_state ?? "not_started") as LessonReviewState,
        review_feedback: record.review_feedback ?? null,
        reviewed_at: record.reviewed_at ?? null,
        solved_questions: solvedByLesson.get(record.lesson_slug) ?? [],
      })),
      databaseReady: true,
    };
  } catch {
    // Network, storage and client-initialisation errors must not crash the course page
    // or imply that an unverified prerequisite has been completed.
    return { records: [], databaseReady: false };
  }
}
