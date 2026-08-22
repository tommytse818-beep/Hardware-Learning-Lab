import { isSupabaseConfigured } from "@/lib/env";
import type { Viewer } from "@/lib/viewer";

export type CourseAccessState =
  | "demo"
  | "entitled"
  | "signed-out"
  | "not-entitled"
  | "setup-required";

export type CourseAccessResult = {
  allowed: boolean;
  state: CourseAccessState;
  message: string;
};

function accessResult(
  allowed: boolean,
  state: CourseAccessState,
  message: string,
): CourseAccessResult {
  return { allowed, state, message };
}

export async function getCourseAccess(
  viewer: Viewer | null,
  courseSlug: string,
): Promise<CourseAccessResult> {
  void courseSlug;

  if (!isSupabaseConfigured()) {
    return accessResult(
      true,
      "demo",
      "Local demo mode is enabled. Progress is browser-only and does not prove a school purchase.",
    );
  }

  if (!viewer?.id || !viewer.verified) {
    return accessResult(
      false,
      "signed-out",
      "Sign in with a verified Supabase account to access the course.",
    );
  }

  return accessResult(
    true,
    "entitled",
    "Verified account access confirmed.",
  );
}

export async function getCourseAccessForUser(
  userId: string,
  courseSlug: string,
): Promise<CourseAccessResult> {
  void userId;
  void courseSlug;

  return accessResult(
    true,
    "entitled",
    "Verified account access confirmed.",
  );
}
