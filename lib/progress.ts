import { isSupabaseConfigured } from "@/lib/env";
import type { LessonReviewState } from "@/lib/lesson-readiness";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const [progressResult, attemptsResult] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_slug, completed, quiz_score, review_state, review_feedback, reviewed_at")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug),
    supabase
      .from("quiz_attempts")
      .select("lesson_slug, question_id, points_awarded, attempt_number")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .eq("correct", true)
      .order("attempt_number", { ascending: true }),
  ]);

  if (progressResult.error || attemptsResult.error) {
    return {
      records: [],
      databaseReady: false,
    };
  }

  const solvedByLesson = new Map<string, SolvedQuestionRecord[]>();

  for (const attempt of attemptsResult.data ?? []) {
    const solved = solvedByLesson.get(attempt.lesson_slug) ?? [];
    if (!solved.some((item) => item.questionId === attempt.question_id)) {
      solved.push({
        questionId: attempt.question_id,
        score: attempt.points_awarded ?? 0,
      });
      solvedByLesson.set(attempt.lesson_slug, solved);
    }
  }

  return {
    records: (progressResult.data ?? []).map((record) => ({
      lesson_slug: record.lesson_slug,
      completed: record.completed,
      quiz_score: record.quiz_score,
      review_state: (record.review_state ?? "not_started") as LessonReviewState,
      review_feedback: record.review_feedback ?? null,
      reviewed_at: record.reviewed_at ?? null,
      solved_questions: solvedByLesson.get(record.lesson_slug) ?? [],
    })),
    databaseReady: true,
  };
}
