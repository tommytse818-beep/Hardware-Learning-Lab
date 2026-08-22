import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "Admin user listing is prepared for the trusted provisioning flow.",
    users: [],
  });
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "Provisioning is limited to the trusted admin workflow and the live Supabase project.",
  });
}
