import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiViewer(["admin"]);
  if (auth.response) return auth.response;

  const { data, error } = await createAdminClient()
    .from("schools")
    .select("id, name, contact_name, contact_email, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Schools could not be loaded." },
      { status: 503 },
    );
  }

  return NextResponse.json({ schools: data ?? [] });
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const contactEmail =
    typeof body.contactEmail === "string"
      ? body.contactEmail.trim().toLowerCase()
      : "";

  if (
    name.length < 2 ||
    name.length > 120 ||
    contactName.length < 2 ||
    contactName.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    return NextResponse.json(
      { error: "Provide a valid school and contact." },
      { status: 400 },
    );
  }

  const { data, error } = await createAdminClient()
    .from("schools")
    .insert({
      name,
      contact_name: contactName,
      contact_email: contactEmail,
      status: "approved",
    })
    .select("id, name, status")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "The school could not be created." },
      { status: 503 },
    );
  }

  return NextResponse.json({ school: data }, { status: 201 });
}
