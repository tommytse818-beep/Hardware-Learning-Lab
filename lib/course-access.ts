import {
  isDemoModeEnabled,
  isSupabaseConfigured,
} from "@/lib/env";
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
  if (!isSupabaseConfigured()) {
    if (isDemoModeEnabled()) {
      return accessResult(
        true,
        "demo",
        "Local demo mode is enabled. Progress is browser-only and does not prove a school purchase.",
      );
    }

    return accessResult(
      false,
      "setup-required",
      "The platform is not configured. Course access cannot be verified in production.",
    );
  }

  if (!viewer?.id || !viewer.verified) {
    return accessResult(
      false,
      "signed-out",
      "Sign in with a verified Supabase account to access the course.",
    );
  }

  if (viewer.mustChangePassword) {
    return accessResult(
      false,
      "setup-required",
      "Complete your first-login setup before your course seat becomes active.",
    );
  }

  if (viewer.role === "admin") {
    return accessResult(
      true,
      "entitled",
      "Administrator course access confirmed.",
    );
  }

  return getCourseAccessForUser(viewer.id, courseSlug);
}

export async function getCourseAccessForUser(
  userId: string,
  courseSlug: string,
): Promise<CourseAccessResult> {
  if (!isSupabaseConfigured()) {
    if (isDemoModeEnabled()) {
      return accessResult(true, "demo", "Local demo mode is enabled.");
    }

    return accessResult(
      false,
      "setup-required",
      "Course access could not be verified because Supabase is not configured.",
    );
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: directAccess, error: directError } = await supabase
    .from("course_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .maybeSingle();

  if (directError && directError.code !== "PGRST116") {
    return accessResult(
      false,
      "setup-required",
      "Course access could not be verified. Please try again later.",
    );
  }

  if (directAccess) {
    return accessResult(
      true,
      "entitled",
      "Verified account access confirmed.",
    );
  }

  const { data: membership, error: membershipError } = await supabase
    .from("cohort_memberships")
    .select("cohort_id")
    .eq("user_id", userId)
    .eq("role", "student")
    .maybeSingle();

  if (membershipError && membershipError.code !== "PGRST116") {
    return accessResult(
      false,
      "setup-required",
      "Course access could not be verified. Please try again later.",
    );
  }

  if (membership) {
    const { data: cohort, error: cohortError } = await supabase
      .from("cohorts")
      .select("id")
      .eq("id", membership.cohort_id)
      .eq("active", true)
      .maybeSingle();

    if (cohortError && cohortError.code !== "PGRST116") {
      return accessResult(
        false,
        "setup-required",
        "Course access could not be verified. Please try again later.",
      );
    }

    if (cohort) {
      const { data: cohortCourse, error: cohortCourseError } = await supabase
        .from("cohort_courses")
        .select("id")
        .eq("cohort_id", membership.cohort_id)
        .eq("course_slug", courseSlug)
        .eq("active", true)
        .maybeSingle();

      if (cohortCourseError && cohortCourseError.code !== "PGRST116") {
        return accessResult(
          false,
          "setup-required",
          "Course access could not be verified. Please try again later.",
        );
      }

      if (cohortCourse) {
        return accessResult(
          true,
          "entitled",
          "Verified cohort course access confirmed.",
        );
      }
    }
  }

  return accessResult(
    false,
    "not-entitled",
    "This account does not have an active seat for this course.",
  );
}
