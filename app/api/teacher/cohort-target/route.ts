import { NextResponse } from "next/server";

import { requireViewerRole } from "@/lib/authorization";

export async function GET() {
  await requireViewerRole(["teacher"]);

  return NextResponse.json(
    {
      ok: false,
      message: "Teacher target data is not available until the assignment-linked cohort layer is connected.",
      target: null,
    },
    { status: 503 },
  );
}

export async function POST() {
  await requireViewerRole(["teacher"]);

  return NextResponse.json(
    {
      ok: false,
      message: "Teacher target updates are not available until the assignment-checked cohort layer is connected.",
    },
    { status: 503 },
  );
}
