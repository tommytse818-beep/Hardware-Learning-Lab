import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "The live cohort layer is not connected yet. No cohort data is available until the trusted membership migration is run.",
      cohorts: [],
    },
    { status: 503 },
  );
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "Cohort creation is not available until the database-backed provisioning flow is connected.",
    },
    { status: 503 },
  );
}
