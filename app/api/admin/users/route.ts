import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/api-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function strongTemporaryPassword() {
  return randomBytes(21).toString("base64url");
}

export async function GET() {
  const auth = await requireApiViewer(["admin"]);
  if (auth.response) return auth.response;

  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, email, role, display_name, must_change_password, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Accounts could not be loaded." },
      { status: 503 },
    );
  }

  return NextResponse.json({ users: data ?? [] });
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

  const cohortId =
    typeof body.cohortId === "string" ? body.cohortId.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const role = body.role === "teacher" ? "teacher" : "student";

  if (
    !/^[0-9a-f-]{36}$/i.test(cohortId) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    displayName.length < 2 ||
    displayName.length > 60
  ) {
    return NextResponse.json(
      { error: "Provide a valid cohort, name and email." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: cohort, error: cohortError } = await admin
    .from("cohorts")
    .select("id, name, student_seat_limit, active")
    .eq("id", cohortId)
    .maybeSingle();

  if (cohortError || !cohort || !cohort.active) {
    return NextResponse.json(
      { error: "The selected cohort is not active." },
      { status: 404 },
    );
  }

  if (role === "student") {
    const { count, error: countError } = await admin
      .from("cohort_memberships")
      .select("id", { count: "exact", head: true })
      .eq("cohort_id", cohortId)
      .eq("role", "student");

    if (countError) {
      return NextResponse.json(
        { error: "The seat count could not be checked." },
        { status: 503 },
      );
    }

    if ((count ?? 0) >= cohort.student_seat_limit) {
      return NextResponse.json(
        { error: `The ${cohort.student_seat_limit}-seat cohort is full.` },
        { status: 409 },
      );
    }
  }

  const temporaryPassword = strongTemporaryPassword();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: "The Auth account could not be created." },
      { status: 503 },
    );
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    email,
    role,
    display_name: displayName,
    leaderboard_alias: displayName,
    avatar_key: "spark",
    bio: "",
    leaderboard_opt_in: false,
    must_change_password: true,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Profile creation failed; the incomplete Auth user was removed." },
      { status: 503 },
    );
  }

  const { error: membershipError } = await admin
    .from("cohort_memberships")
    .insert({
      cohort_id: cohortId,
      user_id: userId,
      role,
    });

  if (membershipError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Cohort assignment failed; the incomplete account was removed." },
      { status: 503 },
    );
  }

  const response = NextResponse.json(
    {
      account: {
        id: userId,
        email,
        displayName,
        role,
        cohort: cohort.name,
      },
      temporaryPassword,
      notice:
        "Copy these credentials now. The plaintext password is not stored and will not be shown again.",
    },
    { status: 201 },
  );
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
