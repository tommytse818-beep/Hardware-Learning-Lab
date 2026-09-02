import { NextResponse } from "next/server";

import { getCourseAccessForUser } from "@/lib/course-access";
import { getCourse, getLesson } from "@/lib/courses";
import { isSupabaseConfigured } from "@/lib/env";
import { parseEngineeringNumber } from "@/lib/engineering";
import { getRequiredQuestionIds, type LessonReviewState } from "@/lib/lesson-readiness";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

export async function POST(request: Request) {
  let body: QuizRequestBody;

  try {
    body = (await request.json()) as QuizRequestBody;
  } catch {
    return NextResponse.json(
      { error: "The quiz request was not valid JSON." },
      { status: 400 },
    );
  }

  const { courseSlug, lessonSlug } = body;

  if (typeof courseSlug !== "string" || typeof lessonSlug !== "string") {
    return NextResponse.json(
      { error: "The quiz request is missing the course or lesson." },
      { status: 400 },
    );
  }

  const course = getCourse(courseSlug);
  const lesson = getLesson(courseSlug, lessonSlug);

  if (!course || !lesson) {
    return NextResponse.json(
      { error: "The requested lesson was not found." },
      { status: 404 },
    );
  }

  const questionId =
    typeof body.questionId === "string" && body.questionId.trim()
      ? body.questionId.trim()
      : lesson.quiz.id;

  const quizDefinition =
    questionId !== "lesson-checkpoint"
      ? (lesson.microChecks ?? []).find((item) => item.id === questionId)
      : lesson.quiz;

  if (!quizDefinition) {
    return NextResponse.json(
      { error: "The requested question was not found in this lesson." },
      { status: 404 },
    );
  }

  let correct = false;
  let submittedAnswer: Record<string, unknown>;

  if (quizDefinition.kind === "choice") {
    if (!Number.isInteger(body.selectedIndex)) {
      return NextResponse.json(
        { error: "Choose one of the available answers first." },
        { status: 400 },
      );
    }

    const answerIndex = body.selectedIndex as number;

    if (answerIndex < 0 || answerIndex >= quizDefinition.options.length) {
      return NextResponse.json(
        { error: "The selected answer is outside the available options." },
        { status: 400 },
      );
    }

    correct = answerIndex === quizDefinition.correctIndex;
    submittedAnswer = { selectedIndex: answerIndex };
  } else {
    const numericAnswer = parseEngineeringNumber(body.numericValue);

    if (numericAnswer === null) {
      return NextResponse.json(
        {
          error:
            "Enter a valid number. Engineering notation such as 550 or 0.55 kΩ is accepted.",
        },
        { status: 400 },
      );
    }

    correct =
      Math.abs(numericAnswer - quizDefinition.answer) <=
      quizDefinition.tolerance;
    submittedAnswer = { numericValue: numericAnswer };
  }

  let saved = false;
  let attemptNumber = 1;
  let pointsAwarded = correct ? 100 : 0;
  let completed = correct;
  let onlineReady = correct;
  let quizScore = pointsAwarded;
  let solvedQuestionIds: string[] = [];
  let reviewState: LessonReviewState = "not_started";
  let saveMessage: string | undefined;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Sign in again." },
        { status: 401 },
      );
    }

    const access = await getCourseAccessForUser(user.id, course.slug);

    if (!access.allowed) {
      return NextResponse.json({ error: access.message }, { status: 403 });
    }

    const { data, error } = await createAdminClient().rpc(
      "record_quiz_attempt_v2",
      {
        p_user_id: user.id,
        p_course_slug: course.slug,
        p_lesson_slug: lesson.slug,
        p_question_id: questionId,
        p_required_question_ids: getRequiredQuestionIds(lesson),
        p_human_review_required: lesson.humanReviewRequired ?? false,
        p_submitted_answer: submittedAnswer,
        p_correct: correct,
      },
    );

    const row = (Array.isArray(data) ? data[0] : data) as
      | AttemptResult
      | null;

    if (error || !row) {
      return NextResponse.json(
        {
          error:
            "Your answer was checked, but the attempt could not be recorded. Try again before continuing.",
        },
        { status: 503 },
      );
    }

    attemptNumber = row.attempt_number;
    pointsAwarded = row.points_awarded;
    completed = row.completed;
    onlineReady = row.online_ready;
    quizScore = row.quiz_score;
    solvedQuestionIds = row.solved_question_ids;
    reviewState = row.review_state;
    saved = true;
  } else {
    return NextResponse.json(
      { error: "Quiz storage is not configured on this deployment." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({
    correct,
    completed,
    onlineReady,
    attemptNumber,
    pointsAwarded,
    score: pointsAwarded,
    quizScore,
    solvedQuestionIds,
    reviewState,
    feedback: correct
      ? attemptNumber === 1
        ? "Correct on the first attempt — 100 points."
        : attemptNumber === 2
          ? "Correct on attempt 2 — 50 points."
          : attemptNumber === 3
            ? "Correct on attempt 3 — 25 points."
            : "Checkpoint complete — no points are awarded after attempt 3."
      : quizDefinition.incorrectFeedback ??
        "The answer does not yet match the requirement. Use the hint, revise one step and try again.",
    hint: correct ? undefined : quizDefinition.hint,
    method: correct ? quizDefinition.method : undefined,
    explanation: correct ? quizDefinition.explanation : undefined,
    saved,
    saveMessage,
  });

  return response;
}
