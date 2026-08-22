import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "Admin schools listing is ready for the live Supabase data layer.",
    schools: [],
  });
}

export async function POST() {
  await requireViewerRole(["admin"]);

  return NextResponse.json({
    ok: true,
    message: "School record creation is gated to the trusted admin workflow.",
  });
}
