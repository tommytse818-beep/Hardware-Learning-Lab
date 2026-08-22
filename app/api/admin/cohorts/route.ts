import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "Admin cohort listing is ready for the database-backed cohort layer.",
    cohorts: [],
  });
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "Cohort creation is limited to the verified admin path and the seat-limit enforcement SQL.",
  });
}
