import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getLesson } from "@/lib/courses";
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
};

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

  const { courseSlug, lessonSlug, selectedIndex } = body;

  if (
    typeof courseSlug !== "string" ||
    typeof lessonSlug !== "string" ||
    !Number.isInteger(selectedIndex)
  ) {
    return NextResponse.json(
      { error: "The quiz request is missing required information." },
      { status: 400 },
    );
  }

  const lesson = getLesson(courseSlug, lessonSlug);

  if (!lesson) {
    return NextResponse.json(
      { error: "The requested lesson was not found." },
      { status: 404 },
    );
  }

  const answerIndex = selectedIndex as number;

  if (answerIndex < 0 || answerIndex >= lesson.quiz.options.length) {
    return NextResponse.json(
      { error: "The selected answer is outside the available options." },
      { status: 400 },
    );
  }

  const correct = answerIndex === lesson.quiz.correctIndex;
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

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("completed, quiz_score")
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();

    const bestScore = Math.max(existing?.quiz_score ?? 0, score);
    const completed = Boolean(existing?.completed) || correct;

    const { error: saveError } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
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
        "The answer was checked, but cloud progress could not be saved. Run supabase/schema.sql and try again.";
    } else {
      saved = true;
    }
  } else {
    const cookieStore = await cookies();
    const existing = decodeDemoProgress(
      cookieStore.get(DEMO_PROGRESS_COOKIE)?.value,
    );
    const updated = mergeDemoProgress(existing, {
      courseSlug,
      lessonSlug,
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
    explanation: lesson.quiz.explanation,
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
