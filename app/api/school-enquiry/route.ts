import { NextResponse } from "next/server";

import { sendEnquiryNotification } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ error: "The enquiry is too large." }, { status: 413 });
  }
  const key = getClientKey(request);
  const now = Date.now();
  const current = requestCounts.get(key);
  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else if (current.count >= RATE_LIMIT) {
    return NextResponse.json({ error: "Too many enquiries. Please try again later." }, { status: 429 });
  } else {
    current.count += 1;
  }

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  const schoolName = typeof body.schoolName === "string" ? body.schoolName.trim() : "";
  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!schoolName || !contactName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 4000) {
    return NextResponse.json({ error: "Please provide a school, contact name, valid email and a message of at least 10 characters." }, { status: 400 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Enquiries are unavailable until Supabase is configured." }, { status: 503 });
  try {
    const { error } = await createAdminClient().from("school_enquiries").insert({
      school_name: schoolName,
      contact_name: contactName,
      email,
      message,
    });

    if (error) throw error;

    const emailResult = await sendEnquiryNotification({
      schoolName,
      contactName,
      email,
      message,
    });

    if (!emailResult.ok) {
      return NextResponse.json({
        ok: true,
        emailStatus: emailResult.reason,
        notice: "The enquiry was saved, but the private notification could not be sent right now.",
      });
    }

    return NextResponse.json({ ok: true, emailStatus: "sent" });
  } catch {
    return NextResponse.json({ error: "We could not send your enquiry. Please try again later." }, { status: 503 });
  }
}