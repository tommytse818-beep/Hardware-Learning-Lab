import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DrawerSensePathway } from "@/components/projects/drawersense-pathway";
import { getCourse } from "@/lib/courses";
import { getCourseAccess } from "@/lib/course-access";
import { getDrawerSenseAccess } from "@/lib/drawersense-access";
import { drawerSenseLessons } from "@/lib/drawersense-curriculum";
import { getDrawerSenseServerProgress } from "@/lib/drawersense-server-progress";
import { drawerSenseMediaResources, getDrawerSenseMediaKeys } from "@/lib/drawersense-media";
import { getActiveCourseResourceKeys } from "@/lib/course-resources";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Week 2 · DrawerSense learning workspace", robots: { index: false, follow: false } };

export default async function WeekTwoPage({ params, searchParams }: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (course?.slug !== "open-guard-mini") notFound();
  const query = await searchParams;
  const requested = query.lesson ? drawerSenseLessons.findIndex((lesson) => lesson.id === query.lesson) : -1;
  if (query.lesson && requested < 0) notFound();
  const viewer = await getViewer();
  if (!viewer?.id || !viewer.verified || viewer.demo) redirect(`/login?next=${encodeURIComponent(`/courses/${course.slug}/week-2${query.lesson ? `?lesson=${query.lesson}` : ""}`)}`);
  const entitlement = await getCourseAccess(viewer, course.slug);
  const access = await getDrawerSenseAccess(viewer, entitlement);
  if (!access.allowed) redirect(`/courses/${course.slug}`);
  const state = await getDrawerSenseServerProgress(viewer.id);
  if (!access.canReview && (!state.databaseReady || !state.weekOneReady)) redirect(`/courses/${course.slug}?blocked=week-2`);
  const firstIncomplete = drawerSenseLessons.findIndex((lesson) => !state.progress[lesson.id]?.complete);
  const frontier = firstIncomplete < 0 ? drawerSenseLessons.length - 1 : firstIncomplete;
  if (!access.canReview && requested > frontier) redirect(`/courses/${course.slug}?blocked=${encodeURIComponent(query.lesson!)}`);
  const initialLesson = drawerSenseLessons[requested < 0 ? frontier : requested].id;
  const activeResourceKeys = await getActiveCourseResourceKeys(course.slug, drawerSenseMediaResources.map((resource) => resource.resourceKey));
  const media = Object.fromEntries(drawerSenseLessons.map((lesson) => [lesson.id, Object.fromEntries((["concept", "solution"] as const).map((kind) => {
    const keys = getDrawerSenseMediaKeys(lesson.id, kind);
    return [kind, activeResourceKeys.has(keys.video) ? {
      videoSrc: `/api/courses/${course.slug}/resources/${keys.video}`,
      captionsSrc: activeResourceKeys.has(keys.captions) ? `/api/courses/${course.slug}/resources/${keys.captions}` : undefined,
      transcriptSrc: activeResourceKeys.has(keys.transcript) ? `/api/courses/${course.slug}/resources/${keys.transcript}` : undefined,
    } : undefined];
  }))]));
  return <>
    <nav aria-label="Course navigation" className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600">
      <Link href={`/courses/${course.slug}`}>← All three weeks</Link>
      <span>{access.canReview ? "Teaching view · published lessons unlocked" : "Your progress is saved to your account"}</span>
    </nav>
    {!state.databaseReady && <p role="alert" className="bg-amber-50 px-6 py-4 text-amber-950">Progress is temporarily unavailable. You can preview the published lessons, but changes cannot be saved yet.</p>}
    <DrawerSensePathway key={`${viewer.id}:${initialLesson}`} canReview={access.canReview} storageScope={viewer.id} initialProgress={state.progress} initialLesson={initialLesson} media={media} />
  </>;
}
