import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCourseAccessForUser } from "@/lib/course-access";
import { getCourse, getLesson } from "@/lib/courses";
import {
  decodeDemoProgress,
  DEMO_PROGRESS_COOKIE,
  encodeDemoProgress,
  mergeDemoProgress,
} from "@/lib/demo-progress";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { parseEngineeringNumber } from "@/lib/engineering";

type QuizRequestBody = {
  courseSlug?: unknown;
  lessonSlug?: unknown;
  questionId?: unknown;
  selectedIndex?: unknown;
  numericValue?: unknown;
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

  const quizDefinition =
    typeof body.questionId === "string"
      ? (lesson.microChecks ?? []).find((item) => item.id === body.questionId)
      : lesson.quiz;

  if (!quizDefinition) {
    return NextResponse.json(
      { error: "The requested question was not found in this lesson." },
      { status: 404 },
    );
  }

  let correct = false;

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
  } else {
    const numericAnswer = parseEngineeringNumber(body.numericValue);

    if (numericAnswer === null) {
      return NextResponse.json(
        {
          error:
            "Enter a valid number. You may use engineering notation such as 550 or 0.55 kΩ.",
        },
        { status: 400 },
      );
    }

    correct =
      Math.abs(numericAnswer - quizDefinition.answer) <= quizDefinition.tolerance;
  }

  const score = correct ? 100 : 0;
  let saved = false;
  let saveMessage: string | undefined;
  let demoProgressCookie: string | undefined;

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
      return NextResponse.json(
        { error: access.message },
        { status: 403 },
      );
    }

    const { error: saveError } = await createAdminClient()
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          course_slug: course.slug,
          lesson_slug: lesson.slug,
          completed: correct,
          quiz_score: score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,lesson_slug" },
      );

    if (saveError) {
      saveMessage =
        "Your answer is correct, but progress sync is temporarily unavailable. You can continue reviewing the course.";
    } else {
      saved = true;
    }
  } else {
    const cookieStore = await cookies();
    const existing = decodeDemoProgress(
      cookieStore.get(DEMO_PROGRESS_COOKIE)?.value,
    );
    const updated = mergeDemoProgress(existing, {
      courseSlug: course.slug,
      lessonSlug: lesson.slug,
      completed: correct,
      quizScore: score,
    });

    demoProgressCookie = encodeDemoProgress(updated);
    saveMessage =
      "Demo mode: saved only in this browser, not as a school or cloud record.";
  }

  const response = NextResponse.json({
    correct,
    score,
    feedback: correct
      ? "Your answer matches the engineering reasoning for this checkpoint."
      : quizDefinition.incorrectFeedback ??
        "The answer does not yet match the requirement. Use the hint, revise one step and try again.",
    hint: correct ? undefined : quizDefinition.hint,
    method: correct ? quizDefinition.method : undefined,
    explanation: correct ? quizDefinition.explanation : undefined,
    saved,
    saveMessage,
  });

  if (demoProgressCookie) {
    response.cookies.set(DEMO_PROGRESS_COOKIE, demoProgressCookie, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
