import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/viewer";

export type CourseAccessState =
  | "entitled"
  | "signed-out"
  | "not-entitled"
  | "setup-required";

export type CourseAccessResult = {
  allowed: boolean;
  state: CourseAccessState;
  message: string;
};

function result(
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
    return result(
      false,
      "setup-required",
      "Course access cannot be checked because this deployment is not configured.",
    );
  }

  if (!viewer?.id || !viewer.verified) {
    return result(
      false,
      "signed-out",
      "Sign in with a verified school-issued account.",
    );
  }

  if (viewer.mustChangePassword) {
    return result(
      false,
      "setup-required",
      "Complete first-login account setup before entering the course.",
    );
  }

  if (viewer.role === "admin") {
    return result(true, "entitled", "Administrator preview access confirmed.");
  }

  return getCourseAccessForUser(viewer.id, courseSlug, viewer.role);
}

export async function getCourseAccessForUser(
  userId: string,
  courseSlug: string,
  knownRole?: "admin" | "teacher" | "student",
): Promise<CourseAccessResult> {
  if (!isSupabaseConfigured()) {
    return result(false, "setup-required", "Supabase is not configured.");
  }

  if (knownRole === "admin") {
    return result(true, "entitled", "Administrator preview access confirmed.");
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: directRows, error: directError } = await supabase
    .from("course_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .limit(1);

  if (directError) {
    return result(
      false,
      "setup-required",
      "Course access could not be verified. Try again shortly.",
    );
  }

  if (directRows && directRows.length > 0) {
    return result(true, "entitled", "Individual course access confirmed.");
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("cohort_memberships")
    .select("cohort_id, role")
    .eq("user_id", userId);

  if (membershipError) {
    return result(
      false,
      "setup-required",
      "Cohort access could not be verified. Try again shortly.",
    );
  }

  if (!memberships || memberships.length === 0) {
    return result(
      false,
      "not-entitled",
      "This account does not have an active seat for this course.",
    );
  }

  const cohortIds = [...new Set(memberships.map((row) => row.cohort_id))];

  const { data: activeCohorts, error: cohortError } = await supabase
    .from("cohorts")
    .select("id")
    .in("id", cohortIds)
    .eq("active", true);

  if (cohortError) {
    return result(
      false,
      "setup-required",
      "Cohort status could not be verified. Try again shortly.",
    );
  }

  const activeIds = activeCohorts?.map((row) => row.id) ?? [];

  if (activeIds.length === 0) {
    return result(
      false,
      "not-entitled",
      "The assigned cohort is not active.",
    );
  }

  const { data: courseRows, error: courseError } = await supabase
    .from("cohort_courses")
    .select("id, cohort_id")
    .in("cohort_id", activeIds)
    .eq("course_slug", courseSlug)
    .eq("active", true)
    .limit(1);

  if (courseError) {
    return result(
      false,
      "setup-required",
      "Course assignment could not be verified. Try again shortly.",
    );
  }

  if (courseRows && courseRows.length > 0) {
    const teacher = memberships.some(
      (membership) =>
        membership.role === "teacher" &&
        courseRows.some((course) => course.cohort_id === membership.cohort_id),
    );

    return result(
      true,
      "entitled",
      teacher
        ? "Assigned teacher course access confirmed."
        : "Active cohort course access confirmed.",
    );
  }

  return result(
    false,
    "not-entitled",
    "This account does not have an active seat for this course.",
  );
}
