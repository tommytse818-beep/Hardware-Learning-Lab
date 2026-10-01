import { NextResponse } from "next/server";

import { getCourseAccess } from "@/lib/course-access";
import { getCourse, getLesson } from "@/lib/courses";
import { parseEngineeringNumber } from "@/lib/engineering";
import { getFormativeCheck } from "@/lib/formative-checks";
import { getLessonAvailability } from "@/lib/lesson-readiness";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond({ error: "Submit practice from the course page." }, 403);
  try {
    const body = await request.json() as Record<string, unknown>;
    const { courseSlug, lessonSlug, questionId } = body;
    if (typeof courseSlug !== "string" || typeof lessonSlug !== "string" || typeof questionId !== "string") return respond({ error: "The practice request is incomplete." }, 400);
    const course = getCourse(courseSlug);
    const lesson = getLesson(courseSlug, lessonSlug);
    const check = getFormativeCheck(questionId, lessonSlug);
    if (!course || !lesson || !check) return respond({ error: "The practice question was not found." }, 404);

    const viewer = await getViewer();
    if (!viewer?.id || viewer.demo) return respond({ error: "Your session has expired. Sign in again." }, 401);
    const access = await getCourseAccess(viewer, course.slug);
    if (!access.allowed || !viewer.verified || viewer.mustChangePassword) return respond({ error: access.allowed ? "Complete verified account setup before continuing." : access.message }, 403);
    const canPreviewAll = viewer.role === "admin" || viewer.role === "teacher";
    const progress = await getCourseProgress(viewer.id, course.slug);
    if (!progress.databaseReady && !canPreviewAll) return respond({ error: "Saved progress could not be verified. Reload and try again." }, 503);
    const completed = new Set(progress.records.filter((record) => record.completed).map((record) => record.lesson_slug));
    const availability = getLessonAvailability(course, completed, canPreviewAll).find((item) => item.lessonSlug === lesson.slug);
    if (!availability?.available) return respond({ error: "Complete every earlier checkpoint before using this practice." }, 409);

    let correct = false;
    if (check.kind === "choice") {
      if (!Number.isInteger(body.selectedIndex) || (body.selectedIndex as number) < 0 || (body.selectedIndex as number) >= check.options.length) return respond({ error: "Choose one available answer." }, 400);
      correct = body.selectedIndex === check.correctIndex;
    } else {
      const value = parseEngineeringNumber(body.numericValue);
      if (value === null || (check.domain === "positive" ? value <= 0 : value < 0)) return respond({ error: check.domain === "nonnegative" ? "Enter zero or a positive value." : "Enter a positive value." }, 400);
      correct = Math.abs(value - check.answer) <= check.tolerance;
    }
    return respond({ correct, saved: false, completed: false, feedback: correct ? check.feedback : "Review one connection or quantity, then try again.", hint: correct ? undefined : check.hint });
  } catch {
    return respond({ error: "This practice answer could not be checked right now." }, 503);
  }
}