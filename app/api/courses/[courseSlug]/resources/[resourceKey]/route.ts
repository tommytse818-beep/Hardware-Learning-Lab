import { NextResponse } from "next/server";

import { getCourseAccess } from "@/lib/course-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/viewer";

type RouteContext = {
  params: Promise<{
    courseSlug: string;
    resourceKey: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { courseSlug, resourceKey } = await context.params;
  const viewer = await getViewer();

  if (!viewer?.id) {
    return NextResponse.json({ error: "Sign in to open this resource." }, { status: 401 });
  }

  const access = await getCourseAccess(viewer, courseSlug);

  if (!access.allowed) {
    return NextResponse.json({ error: access.message }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: resource, error: resourceError } = await admin
    .from("course_resources")
    .select("bucket_id, object_path, title")
    .eq("course_slug", courseSlug)
    .eq("resource_key", resourceKey)
    .eq("active", true)
    .maybeSingle();

  if (resourceError || !resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from(resource.bucket_id)
    .createSignedUrl(resource.object_path, 60 * 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "The protected resource could not be opened." },
      { status: 503 },
    );
  }

  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
