import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["teacher"]);

  return NextResponse.json({
    ok: true,
    message: "Teacher cohort-target data is ready for the cohort-linked assignment layer.",
    target: null,
  });
}

export async function POST() {
  await requireViewerRole(["teacher"]);

  return NextResponse.json({
    ok: true,
    message: "Teacher target updates are restricted to assigned cohorts only.",
  });
}
