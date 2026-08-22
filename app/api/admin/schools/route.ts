import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "The live school-provisioning layer is not connected yet. No schools are available until the database-backed admin flow is provisioned.",
      schools: [],
    },
    { status: 503 },
  );
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "School creation is not yet connected to the live admin workflow.",
    },
    { status: 503 },
  );
}
