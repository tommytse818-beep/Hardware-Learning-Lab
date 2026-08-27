import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { sendCatchUpReminder } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

type ReminderReservation = {
  reminder_id: number | string | null;
  allowed: boolean;
};

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
    return NextResponse.json(
      { error: "Invalid reminder target." },
      { status: 400 },
    );
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

  if (teacherMembership.error || studentMembership.error) {
    return NextResponse.json(
      { error: "Teacher/student cohort assignment could not be verified." },
      { status: 503 },
    );
  }

  if (!teacherMembership.data || !studentMembership.data) {
    return NextResponse.json(
      { error: "Teacher/student cohort assignment was not verified." },
      { status: 403 },
    );
  }

  const [profileResult, cohortResult, targetResult] = await Promise.all([
    admin
      .from("profiles")
      .select("email, display_name")
      .eq("id", studentId)
      .maybeSingle(),
    admin
      .from("cohorts")
      .select("name, active")
      .eq("id", cohortId)
      .eq("active", true)
      .maybeSingle(),
    admin
      .from("cohort_targets")
      .select("target_lesson_slug")
      .eq("cohort_id", cohortId)
      .maybeSingle(),
  ]);

  if (profileResult.error || cohortResult.error || targetResult.error) {
    return NextResponse.json(
      { error: "Learner or active cohort data could not be loaded." },
      { status: 503 },
    );
  }

  if (!profileResult.data || !cohortResult.data) {
    return NextResponse.json(
      { error: "Learner or active cohort data is unavailable." },
      { status: 404 },
    );
  }

  const { data: reservationData, error: reservationError } = await admin.rpc(
    "reserve_teacher_reminder_v1",
    {
      p_teacher_id: auth.viewer.id,
      p_student_id: studentId,
      p_cohort_id: cohortId,
    },
  );

  const reservation = (Array.isArray(reservationData)
    ? reservationData[0]
    : reservationData) as ReminderReservation | null;

  if (reservationError || !reservation) {
    return NextResponse.json(
      { error: "The reminder could not be reserved safely." },
      { status: 503 },
    );
  }

  if (!reservation.allowed) {
    return NextResponse.json(
      {
        error:
          "A reminder was already sent or reserved for this learner in the last 24 hours.",
      },
      { status: 429 },
    );
  }

  if (reservation.reminder_id === null) {
    return NextResponse.json(
      { error: "The reminder reservation did not return an audit identifier." },
      { status: 503 },
    );
  }

  const emailResult = await sendCatchUpReminder({
    to: profileResult.data.email,
    learnerName: profileResult.data.display_name || "Learner",
    cohortName: cohortResult.data.name,
    targetLesson: targetResult.data?.target_lesson_slug,
  });

  const finalStatus = emailResult.ok ? "sent" : "failed";
  const errorCode = emailResult.ok
    ? null
    : emailResult.errorCode ?? emailResult.reason;

  let { error: auditError } = await admin
    .from("teacher_reminders")
    .update({
      status: finalStatus,
      error_code: errorCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservation.reminder_id);

  if (auditError) {
    const retry = await admin
      .from("teacher_reminders")
      .update({
        status: finalStatus,
        error_code: errorCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservation.reminder_id);
    auditError = retry.error;
  }

  if (!emailResult.ok) {
    return NextResponse.json(
      { error: "The reminder was authorized but could not be delivered." },
      { status: 503 },
    );
  }

  if (auditError) {
    // Delivery succeeded. Returning 202 avoids encouraging an immediate retry;
    // operations should inspect the pending audit reservation.
    return NextResponse.json(
      { ok: true, warning: "The email was sent, but its audit status needs review." },
      { status: 202 },
    );
  }

  return NextResponse.json({ ok: true });
}
