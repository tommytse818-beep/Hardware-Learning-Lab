import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

async function teacherOwnsCohort(teacherId: string, cohortId: string) {
  const { data } = await createAdminClient()
    .from("cohort_memberships")
    .select("id")
    .eq("user_id", teacherId)
    .eq("cohort_id", cohortId)
    .eq("role", "teacher")
    .maybeSingle();

  return Boolean(data);
}

export async function GET(request: Request) {
  const auth = await requireApiViewer(["teacher"]);
  if (auth.response) return auth.response;

  const cohortId = new URL(request.url).searchParams.get("cohortId") ?? "";

  if (!(await teacherOwnsCohort(auth.viewer.id!, cohortId))) {
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
  const targetLessonSlug =
    typeof body?.targetLessonSlug === "string"
      ? body.targetLessonSlug.trim()
      : "";

  if (
    !/^[0-9a-f-]{36}$/i.test(cohortId) ||
    !/^[a-z0-9][a-z0-9-]{1,100}$/.test(targetLessonSlug)
  ) {
    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  }

  if (!(await teacherOwnsCohort(auth.viewer.id!, cohortId))) {
    return NextResponse.json({ error: "Cohort not assigned." }, { status: 403 });
  }

  const { data, error } = await createAdminClient()
    .from("cohort_targets")
    .upsert({
      cohort_id: cohortId,
      target_lesson_slug: targetLessonSlug,
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
