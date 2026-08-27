import { NextResponse } from "next/server";

import { sendEnquiryNotification } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 12_000) {
    return NextResponse.json({ error: "The enquiry is too large." }, { status: 413 });
  }

  try {
    const allowed = await consumeRateLimit(
      request,
      "school-enquiry",
      5,
      60 * 60,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many enquiries. Please try again later." },
        { status: 429 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "The enquiry service is temporarily unavailable." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true });

  const schoolName =
    typeof body.schoolName === "string" ? body.schoolName.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (
    schoolName.length < 2 ||
    schoolName.length > 120 ||
    contactName.length < 2 ||
    contactName.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 10 ||
    message.length > 4000
  ) {
    return NextResponse.json(
      { error: "Provide a valid school, contact, email and message." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Enquiries are unavailable on this deployment." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: enquiry, error: insertError } = await admin
    .from("school_enquiries")
    .insert({
      school_name: schoolName,
      contact_name: contactName,
      email,
      message,
      notification_status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !enquiry) {
    return NextResponse.json(
      { error: "The enquiry could not be saved." },
      { status: 503 },
    );
  }

  const emailResult = await sendEnquiryNotification({
    schoolName,
    contactName,
    email,
    message,
  });

  await admin
    .from("school_enquiries")
    .update({
      notification_status: emailResult.ok ? "sent" : "failed",
      notification_error_code: emailResult.ok
        ? null
        : emailResult.errorCode ?? emailResult.reason,
      notification_sent_at: emailResult.ok
        ? new Date().toISOString()
        : null,
    })
    .eq("id", enquiry.id);

  return NextResponse.json({
    ok: true,
    notification: emailResult.ok ? "sent" : "pending-follow-up",
    notice: emailResult.ok
      ? "Your enquiry was received."
      : "Your enquiry was saved. The programme team will review it even though the private notification is delayed.",
  });
}
