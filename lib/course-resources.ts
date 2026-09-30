import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function hasActiveCourseResource(
  courseSlug: string,
  resourceKey: string,
) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("course_resources")
      .select("resource_key")
      .eq("course_slug", courseSlug)
      .eq("resource_key", resourceKey)
      .eq("active", true)
      .maybeSingle();

    return !error && Boolean(data);
  } catch {
    return false;
  }
}
