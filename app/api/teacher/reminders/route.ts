import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function POST() {
  await requireViewerRole(["teacher"]);

  return NextResponse.json({
    ok: true,
    message: "Teacher reminder triggering is restricted to assigned cohort members and rate-limited by the server layer.",
  });
}
