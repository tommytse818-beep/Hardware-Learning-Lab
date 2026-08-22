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
import { createClient } from "@/lib/supabase/server";

type QuizRequestBody = {
  courseSlug?: unknown;
  lessonSlug?: unknown;
  selectedIndex?: unknown;
  numericValue?: unknown;
};

function parseEngineeringNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll("ω", "ohm")
    .replaceAll("Ω", "ohm");

  const match = normalized.match(
    /^([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?)\s*([a-zµ]*)/i,
  );

  if (!match) {
    return null;
  }

  const base = Number(match[1]);
  const suffix = match[2] ?? "";

  if (!Number.isFinite(base)) {
    return null;
  }

  if (suffix.startsWith("k")) {
    return base * 1_000;
  }

  if (suffix.startsWith("meg")) {
    return base * 1_000_000;
  }

  if (suffix === "m" || suffix.startsWith("milli")) {
    return base / 1_000;
  }

  if (suffix === "u" || suffix === "µ" || suffix.startsWith("micro")) {
    return base / 1_000_000;
  }

  return base;
}

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

  let correct = false;

  if (lesson.quiz.kind === "choice") {
    if (!Number.isInteger(body.selectedIndex)) {
      return NextResponse.json(
        { error: "Choose one of the available answers first." },
        { status: 400 },
      );
    }

    const answerIndex = body.selectedIndex as number;

    if (answerIndex < 0 || answerIndex >= lesson.quiz.options.length) {
      return NextResponse.json(
        { error: "The selected answer is outside the available options." },
        { status: 400 },
      );
    }

    correct = answerIndex === lesson.quiz.correctIndex;
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
      Math.abs(numericAnswer - lesson.quiz.answer) <= lesson.quiz.tolerance;
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

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("completed, quiz_score")
      .eq("user_id", user.id)
      .eq("course_slug", course.slug)
      .eq("lesson_slug", lesson.slug)
      .maybeSingle();

    const bestScore = Math.max(existing?.quiz_score ?? 0, score);
    const completed = Boolean(existing?.completed) || correct;

    const { error: saveError } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          course_slug: course.slug,
          lesson_slug: lesson.slug,
          completed,
          quiz_score: bestScore,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,course_slug,lesson_slug",
        },
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
      : lesson.quiz.incorrectFeedback ??
        "The answer does not yet match the requirement. Use the hint, revise one step and try again.",
    hint: correct ? undefined : lesson.quiz.hint,
    method: correct ? lesson.quiz.method : undefined,
    explanation: correct ? lesson.quiz.explanation : undefined,
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
