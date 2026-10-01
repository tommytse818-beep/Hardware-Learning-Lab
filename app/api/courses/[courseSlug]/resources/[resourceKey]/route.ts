import { NextResponse } from "next/server";

import { getCourseAccess } from "@/lib/course-access";
import { getDrawerSenseAccess } from "@/lib/drawersense-access";
import { drawerSenseLessons } from "@/lib/drawersense-curriculum";
import { getDrawerSenseMediaResource } from "@/lib/drawersense-media";
import { getDrawerSenseServerProgress } from "@/lib/drawersense-server-progress";
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

  const drawerSenseMedia = courseSlug === "open-guard-mini"
    ? getDrawerSenseMediaResource(resourceKey)
    : null;
  if (drawerSenseMedia) {
    const drawerSenseAccess = await getDrawerSenseAccess(viewer, access);
    if (!drawerSenseAccess.allowed) {
      return NextResponse.json({ error: "Verified course access is required." }, { status: 403 });
    }
    if (!drawerSenseAccess.canReview) {
      const state = await getDrawerSenseServerProgress(viewer.id);
      if (!state.databaseReady || !state.weekOneReady) {
        return NextResponse.json({ error: "Current lesson access could not be verified." }, { status: 403 });
      }
      const lessonIndex = drawerSenseLessons.findIndex((lesson) => lesson.id === drawerSenseMedia.lessonId);
      const priorComplete = lessonIndex >= 0 && drawerSenseLessons.slice(0, lessonIndex).every((lesson) => state.progress[lesson.id]?.complete);
      if (!priorComplete) {
        return NextResponse.json({ error: "Complete the earlier activity before opening this resource." }, { status: 403 });
      }
      if (drawerSenseMedia.kind === "solution") {
        const work = state.progress[drawerSenseMedia.lessonId];
        const lesson = drawerSenseLessons[lessonIndex];
        const solutionReady = Boolean(work?.saved && lesson.questions.every((question) => work.correct.includes(question.id)));
        if (!solutionReady) {
          return NextResponse.json({ error: "Save the required attempt and checks before opening this solution resource." }, { status: 403 });
        }
      }
    }
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
