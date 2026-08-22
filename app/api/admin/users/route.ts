import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "The live admin user-provisioning layer is not connected yet.",
      users: [],
    },
    { status: 503 },
  );
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json(
    {
      ok: false,
      message: "Provisioning is not available until the live Supabase admin flow is configured.",
    },
    { status: 503 },
  );
}
