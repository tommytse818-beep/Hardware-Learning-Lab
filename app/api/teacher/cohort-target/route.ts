import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { getLesson } from "@/lib/courses";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkTeacherCohortAssignment(
  teacherId: string,
  cohortId: string,
) {
  const { data, error } = await createAdminClient()
    .from("cohort_memberships")
    .select("id")
    .eq("user_id", teacherId)
    .eq("cohort_id", cohortId)
    .eq("role", "teacher")
    .maybeSingle();

  return { assigned: Boolean(data), error };
}

export async function GET(request: Request) {
  const auth = await requireApiViewer(["teacher"]);
  if (auth.response) return auth.response;

  const cohortId = new URL(request.url).searchParams.get("cohortId") ?? "";

  if (!/^[0-9a-f-]{36}$/i.test(cohortId)) {
    return NextResponse.json({ error: "Invalid cohort." }, { status: 400 });
  }

  const assignment = await checkTeacherCohortAssignment(
    auth.viewer.id!,
    cohortId,
  );

  if (assignment.error) {
    return NextResponse.json(
      { error: "The cohort assignment could not be verified." },
      { status: 503 },
    );
  }

  if (!assignment.assigned) {
    return NextResponse.json({ error: "Cohort not assigned." }, { status: 403 });
  }

  const { data, error } = await createAdminClient()
    .from("cohort_targets")
    .select("target_lesson_slug, updated_at")
    .eq("cohort_id", cohortId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Target could not be loaded." },
      { status: 503 },
    );
  }

  return NextResponse.json({ target: data ?? null });
}

export async function POST(request: Request) {
  const auth = await requireApiViewer(["teacher"]);
  if (auth.response) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { cohortId?: unknown; targetLessonSlug?: unknown }
    | null;

  const cohortId =
    typeof body?.cohortId === "string" ? body.cohortId.trim() : "";
  const requestedLessonSlug =
    typeof body?.targetLessonSlug === "string"
      ? body.targetLessonSlug.trim()
      : "";

  if (
    !/^[0-9a-f-]{36}$/i.test(cohortId) ||
    !/^[a-z0-9][a-z0-9-]{1,100}$/.test(requestedLessonSlug)
  ) {
    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  }

  const assignment = await checkTeacherCohortAssignment(
    auth.viewer.id!,
    cohortId,
  );

  if (assignment.error) {
    return NextResponse.json(
      { error: "The cohort assignment could not be verified." },
      { status: 503 },
    );
  }

  if (!assignment.assigned) {
    return NextResponse.json({ error: "Cohort not assigned." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: cohort, error: cohortError } = await admin
    .from("cohorts")
    .select("course_slug, active")
    .eq("id", cohortId)
    .eq("active", true)
    .maybeSingle();

  if (cohortError) {
    return NextResponse.json(
      { error: "The assigned cohort could not be verified." },
      { status: 503 },
    );
  }

  if (!cohort) {
    return NextResponse.json(
      { error: "The assigned cohort is inactive or unavailable." },
      { status: 409 },
    );
  }

  const lesson = getLesson(cohort.course_slug, requestedLessonSlug);
  if (!lesson) {
    return NextResponse.json(
      { error: "Choose a lesson that belongs to the cohort course." },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("cohort_targets")
    .upsert({
      cohort_id: cohortId,
      target_lesson_slug: lesson.slug,
      updated_by: auth.viewer.id,
      updated_at: new Date().toISOString(),
    })
    .select("target_lesson_slug, updated_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Target could not be saved." },
      { status: 503 },
    );
  }

  return NextResponse.json({ target: data });
}
