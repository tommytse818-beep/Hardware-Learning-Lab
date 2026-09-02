import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { getLesson } from "@/lib/courses";
import { createAdminClient } from "@/lib/supabase/admin";

type ReviewDecision = "approved" | "revision_requested";

type ReviewRequestBody = {
  studentId?: unknown;
  courseSlug?: unknown;
  lessonSlug?: unknown;
  decision?: unknown;
  feedback?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const auth = await requireApiViewer(["admin", "teacher"]);
  if (auth.response) return auth.response;

  const body = (await request.json().catch(() => null)) as ReviewRequestBody | null;
  const studentId = cleanText(body?.studentId);
  const courseSlug = cleanText(body?.courseSlug);
  const lessonSlug = cleanText(body?.lessonSlug);
  const decision = cleanText(body?.decision) as ReviewDecision;
  const feedback = cleanText(body?.feedback);

  if (
    !/^[0-9a-f-]{36}$/i.test(studentId) ||
    !/^[a-z0-9][a-z0-9-]{1,80}$/.test(courseSlug) ||
    !/^[a-z0-9][a-z0-9-]{1,100}$/.test(lessonSlug) ||
    !["approved", "revision_requested"].includes(decision) ||
    feedback.length > 500
  ) {
    return NextResponse.json({ error: "Invalid review request." }, { status: 400 });
  }

  const lesson = getLesson(courseSlug, lessonSlug);
  if (!lesson?.humanReviewRequired) {
    return NextResponse.json(
      { error: "This lesson does not require human review." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  if (auth.viewer.role === "teacher") {
    const { data, error } = await admin
      .from("cohort_memberships")
      .select("cohort_id, role")
      .in("user_id", [auth.viewer.id, studentId]);

    if (error) {
      return NextResponse.json(
        { error: "Review authorization could not be verified." },
        { status: 503 },
      );
    }

    const teacherCohorts = new Set(
      (data ?? [])
        .filter((row) => row.role === "teacher")
        .map((row) => row.cohort_id),
    );
    const assigned = (data ?? []).some(
      (row) => row.role === "student" && teacherCohorts.has(row.cohort_id),
    );

    if (!assigned) {
      return NextResponse.json(
        { error: "This learner is not assigned to your cohort." },
        { status: 403 },
      );
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("lesson_progress")
    .update({
      completed: decision === "approved",
      review_state: decision,
      reviewer_id: auth.viewer.id,
      reviewed_at: now,
      review_feedback: feedback || null,
      updated_at: now,
    })
    .eq("user_id", studentId)
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lesson.slug)
    .in("review_state", ["awaiting_review", "revision_requested"])
    .select("lesson_slug, completed, review_state, review_feedback, reviewed_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "The review decision could not be saved." },
      { status: 503 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "No checkpoint is awaiting review for this learner." },
      { status: 409 },
    );
  }

  return NextResponse.json({ review: data });
}
