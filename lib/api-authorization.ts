import { NextResponse } from "next/server";

import { getViewer, type Viewer, type ViewerRole } from "@/lib/viewer";

export type ApiViewerResult =
  | { viewer: Viewer; response?: never }
  | { viewer?: never; response: NextResponse };

export async function requireApiViewer(
  allowedRoles: ViewerRole[],
): Promise<ApiViewerResult> {
  const viewer = await getViewer();

  if (!viewer?.id) {
    return {
      response: NextResponse.json(
        { error: "Authentication is required." },
        { status: 401 },
      ),
    };
  }

  if (viewer.mustChangePassword) {
    return {
      response: NextResponse.json(
        { error: "Complete first-login account setup." },
        { status: 403 },
      ),
    };
  }

  if (!allowedRoles.includes(viewer.role)) {
    return {
      response: NextResponse.json(
        { error: "This account is not authorized for that operation." },
        { status: 403 },
      ),
    };
  }

  return { viewer };
}
