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

export async function getActiveCourseResourceKeys(courseSlug: string, resourceKeys: string[]) {
  if (resourceKeys.length === 0) return new Set<string>();
  try {
    const { data, error } = await createAdminClient()
      .from("course_resources")
      .select("resource_key")
      .eq("course_slug", courseSlug)
      .eq("active", true)
      .in("resource_key", resourceKeys);
    if (error) return new Set<string>();
    return new Set((data ?? []).map((resource) => String(resource.resource_key)));
  } catch {
    return new Set<string>();
  }
}
