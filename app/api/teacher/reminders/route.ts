import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { sendCatchUpReminder } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireApiViewer(["teacher"]);
  if (auth.response) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { cohortId?: unknown; studentId?: unknown }
    | null;

  const cohortId =
    typeof body?.cohortId === "string" ? body.cohortId.trim() : "";
  const studentId =
    typeof body?.studentId === "string" ? body.studentId.trim() : "";

  if (
    !/^[0-9a-f-]{36}$/i.test(cohortId) ||
    !/^[0-9a-f-]{36}$/i.test(studentId)
  ) {
    return NextResponse.json({ error: "Invalid reminder target." }, { status: 400 });
  }

  const admin = createAdminClient();

  const [teacherMembership, studentMembership] = await Promise.all([
    admin
      .from("cohort_memberships")
      .select("id")
      .eq("cohort_id", cohortId)
      .eq("user_id", auth.viewer.id)
      .eq("role", "teacher")
      .maybeSingle(),
    admin
      .from("cohort_memberships")
      .select("id")
      .eq("cohort_id", cohortId)
      .eq("user_id", studentId)
      .eq("role", "student")
      .maybeSingle(),
  ]);

  if (!teacherMembership.data || !studentMembership.data) {
    return NextResponse.json(
      { error: "Teacher/student cohort assignment was not verified." },
      { status: 403 },
    );
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from("teacher_reminders")
    .select("id")
    .eq("teacher_id", auth.viewer.id)
    .eq("student_id", studentId)
    .eq("cohort_id", cohortId)
    .eq("status", "sent")
    .gte("sent_at", since)
    .limit(1);

  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: "A reminder was already sent to this learner in the last 24 hours." },
      { status: 429 },
    );
  }

  const [profileResult, cohortResult, targetResult] = await Promise.all([
    admin
      .from("profiles")
      .select("email, display_name")
      .eq("id", studentId)
      .maybeSingle(),
    admin.from("cohorts").select("name").eq("id", cohortId).maybeSingle(),
    admin
      .from("cohort_targets")
      .select("target_lesson_slug")
      .eq("cohort_id", cohortId)
      .maybeSingle(),
  ]);

  if (!profileResult.data || !cohortResult.data) {
    return NextResponse.json(
      { error: "Learner or cohort data is unavailable." },
      { status: 404 },
    );
  }

  const emailResult = await sendCatchUpReminder({
    to: profileResult.data.email,
    learnerName: profileResult.data.display_name || "Learner",
    cohortName: cohortResult.data.name,
    targetLesson: targetResult.data?.target_lesson_slug,
  });

  await admin.from("teacher_reminders").insert({
    teacher_id: auth.viewer.id,
    student_id: studentId,
    cohort_id: cohortId,
    status: emailResult.ok ? "sent" : "failed",
    error_code: emailResult.ok ? null : emailResult.errorCode ?? emailResult.reason,
  });

  if (!emailResult.ok) {
    return NextResponse.json(
      { error: "The reminder was authorized but could not be delivered." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
