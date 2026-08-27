import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiViewer(["admin"]);
  if (auth.response) return auth.response;

  const { data, error } = await createAdminClient()
    .from("cohorts")
    .select("id, school_id, name, course_slug, student_seat_limit, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Cohorts could not be loaded." },
      { status: 503 },
    );
  }

  return NextResponse.json({ cohorts: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireApiViewer(["admin"]);
  if (auth.response) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const schoolId =
    typeof body.schoolId === "string" ? body.schoolId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const courseSlug =
    typeof body.courseSlug === "string" ? body.courseSlug.trim() : "";
  const seatLimit = Number(body.studentSeatLimit);

  if (
    !/^[0-9a-f-]{36}$/i.test(schoolId) ||
    name.length < 2 ||
    name.length > 100 ||
    !/^[a-z0-9][a-z0-9-]{1,80}$/.test(courseSlug) ||
    !Number.isInteger(seatLimit) ||
    seatLimit < 1 ||
    seatLimit > 200
  ) {
    return NextResponse.json(
      { error: "Provide a valid school, cohort, course and seat limit." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: school } = await admin
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .maybeSingle();

  if (!school) {
    return NextResponse.json({ error: "School not found." }, { status: 404 });
  }

  const { data: cohort, error: cohortError } = await admin
    .from("cohorts")
    .insert({
      school_id: schoolId,
      name,
      course_slug: courseSlug,
      student_seat_limit: seatLimit,
      active: true,
    })
    .select("id, name, course_slug, student_seat_limit")
    .single();

  if (cohortError || !cohort) {
    return NextResponse.json(
      { error: "The cohort could not be created." },
      { status: 503 },
    );
  }

  const { error: assignmentError } = await admin
    .from("cohort_courses")
    .insert({
      cohort_id: cohort.id,
      course_slug: courseSlug,
      active: true,
    });

  if (assignmentError) {
    await admin.from("cohorts").delete().eq("id", cohort.id);
    return NextResponse.json(
      { error: "The course assignment failed; the incomplete cohort was removed." },
      { status: 503 },
    );
  }

  return NextResponse.json({ cohort }, { status: 201 });
}
