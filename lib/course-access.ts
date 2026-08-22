import { isSupabaseConfigured } from "@/lib/env";
import type { Viewer } from "@/lib/viewer";
import { createClient } from "@/lib/supabase/server";

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

  return getCourseAccessForUser(viewer.id, courseSlug);
}

export async function getCourseAccessForUser(
  userId: string,
  courseSlug: string,
): Promise<CourseAccessResult> {
  if (!isSupabaseConfigured()) {
    return accessResult(true, "demo", "Local demo mode is enabled.");
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("course_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .maybeSingle();

  if (error) {
    return accessResult(false, "setup-required", "Course access could not be verified. Please try again later.");
  }
  if (!data) {
    return accessResult(false, "not-entitled", "This account does not have an active seat for this course.");
  }

  return accessResult(
    true,
    "entitled",
    "Verified account access confirmed.",
  );
}
