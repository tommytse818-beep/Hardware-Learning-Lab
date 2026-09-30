import { NextResponse } from "next/server";

import { getCourseAccess } from "@/lib/course-access";
import { getCourse, getLesson } from "@/lib/courses";
import { isSupabaseConfigured } from "@/lib/env";
import { parseEngineeringNumber } from "@/lib/engineering";
import { getLessonAvailability, getRequiredQuestionIds, type LessonReviewState } from "@/lib/lesson-readiness";
import { getCourseProgress } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/viewer";

type QuizRequestBody = {
  courseSlug?: unknown;
  lessonSlug?: unknown;
  questionId?: unknown;
  selectedIndex?: unknown;
  numericValue?: unknown;
};

type AttemptResult = {
  attempt_number: number;
  points_awarded: number;
  correct: boolean;
  completed: boolean;
  online_ready: boolean;
  quiz_score: number;
  solved_question_ids: string[];
  review_state: LessonReviewState;
};

export { parseEngineeringNumber } from "@/lib/engineering";

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return respond({ error: "Submit your answer from the course page." }, 403);
  }
  try {
    return await submitAnswer(request);
  } catch {
    return respond({ error: "Your answer could not be recorded right now. Please try again before continuing." }, 503);
  }
}

async function submitAnswer(request: Request) {
  let body: QuizRequestBody;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "The quiz request was not valid JSON." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return respond({ error: "The quiz request was not valid." }, 400);
  }
  const { courseSlug, lessonSlug } = body;
  if (typeof courseSlug !== "string" || typeof lessonSlug !== "string") {
    return respond({ error: "The quiz request is missing the course or lesson." }, 400);
  }
  const course = getCourse(courseSlug);
  const lesson = getLesson(courseSlug, lessonSlug);
  if (!course || !lesson) return respond({ error: "The requested lesson was not found." }, 404);
  if (!isSupabaseConfigured()) return respond({ error: "Quiz storage is not configured on this deployment." }, 503);

  const viewer = await getViewer();
  if (!viewer?.id || viewer.demo) return respond({ error: "Your session has expired. Sign in again." }, 401);
  const access = await getCourseAccess(viewer, course.slug);
  if (!access.allowed || !viewer.verified || viewer.mustChangePassword) {
    return respond({ error: access.allowed ? "Complete verified account setup before continuing." : access.message }, 403);
  }
  const canPreviewAll = viewer.role === "admin" || viewer.role === "teacher";
  const progress = await getCourseProgress(viewer.id, course.slug);
  if (!progress.databaseReady && !canPreviewAll) {
    return respond({ error: "Saved progress could not be verified. Reload the lesson and try again." }, 503);
  }
  const completedSlugs = new Set(progress.records.filter((record) => record.completed).map((record) => record.lesson_slug));
  const availability = getLessonAvailability(course, completedSlugs, canPreviewAll).find((item) => item.lessonSlug === lesson.slug);
  if (!availability?.available) {
    return respond({ error: "Complete every earlier checkpoint before answering this lesson.", blockedBy: availability?.blockedBy }, 409);
  }

  const requestedId = typeof body.questionId === "string" && body.questionId.trim() ? body.questionId.trim() : lesson.quiz.id;
  const questionId = requestedId === "lesson-checkpoint" ? lesson.quiz.id : requestedId;
  const requiredQuestions = lesson.microChecks?.length ? lesson.microChecks : [lesson.quiz];
  const quizDefinition = requiredQuestions.find((question) => question.id === questionId);
  if (!quizDefinition) return respond({ error: "The requested question was not found in this lesson." }, 404);

  let correct: boolean;
  let submittedAnswer: Record<string, unknown>;
  if (quizDefinition.kind === "choice") {
    if (!Number.isInteger(body.selectedIndex)) return respond({ error: "Choose one of the available answers first." }, 400);
    const answerIndex = body.selectedIndex as number;
    if (answerIndex < 0 || answerIndex >= quizDefinition.options.length) {
      return respond({ error: "The selected answer is outside the available options." }, 400);
    }
    correct = answerIndex === quizDefinition.correctIndex;
    submittedAnswer = { selectedIndex: answerIndex };
  } else {
    const numericAnswer = parseEngineeringNumber(body.numericValue);
    if (numericAnswer === null) {
      return respond({ error: "Enter a valid number. Engineering notation such as 1200 or 1.2 kΩ is accepted." }, 400);
    }
    correct = Math.abs(numericAnswer - quizDefinition.answer) <= quizDefinition.tolerance;
    submittedAnswer = { numericValue: numericAnswer };
  }

  if (canPreviewAll) {
    return respond({
      correct, preview: true, saved: false, completed: false, onlineReady: false,
      pointsAwarded: 0, score: 0,
      feedback: correct ? "Correct in teaching preview. No learner progress was recorded." : quizDefinition.incorrectFeedback ?? "Review the hint and try again.",
      hint: correct ? undefined : quizDefinition.hint,
      method: correct ? quizDefinition.method : undefined,
      explanation: correct ? quizDefinition.explanation : undefined,
    });
  }

  const { data, error } = await createAdminClient().rpc("record_quiz_attempt_v2", {
    p_user_id: viewer.id,
    p_course_slug: course.slug,
    p_lesson_slug: lesson.slug,
    p_question_id: questionId,
    p_required_question_ids: getRequiredQuestionIds(lesson),
    p_human_review_required: lesson.humanReviewRequired ?? false,
    p_submitted_answer: submittedAnswer,
    p_correct: correct,
  });
  const row = (Array.isArray(data) ? data[0] : data) as AttemptResult | null;
  if (error || !row) {
    return respond({ error: "Your answer was checked, but the attempt could not be recorded. Try again before continuing." }, 503);
  }
  return respond({
    correct,
    completed: row.completed,
    onlineReady: row.online_ready,
    attemptNumber: row.attempt_number,
    pointsAwarded: row.points_awarded,
    score: row.points_awarded,
    quizScore: row.quiz_score,
    solvedQuestionIds: row.solved_question_ids,
    reviewState: row.review_state,
    feedback: correct
      ? row.attempt_number === 1
        ? "Correct on the first attempt — 100 points."
        : row.attempt_number === 2
          ? "Correct on attempt 2 — 50 points."
          : row.attempt_number === 3
            ? "Correct on attempt 3 — 25 points."
            : "Checkpoint complete — no points are awarded after attempt 3."
      : quizDefinition.incorrectFeedback ?? "The answer does not yet match the requirement. Use the hint, revise one step and try again.",
    hint: correct ? undefined : quizDefinition.hint,
    method: correct ? quizDefinition.method : undefined,
    explanation: correct ? quizDefinition.explanation : undefined,
    saved: true,
  });
}
