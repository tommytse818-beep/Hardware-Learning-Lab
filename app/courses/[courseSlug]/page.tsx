import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CourseLearningPanel } from "@/components/course/course-learning-panel";
import { getCourseAccess } from "@/lib/course-access";
import { getCourse } from "@/lib/courses";
import { getDrawerSenseServerProgress } from "@/lib/drawersense-server-progress";
import { getCourseProgress } from "@/lib/progress";
import { getViewer } from "@/lib/viewer";

type Props = {
  params: Promise<{ courseSlug: string }>;
  searchParams?: Promise<{ blocked?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  return { title: getCourse(courseSlug)?.title ?? "Course", robots: { index: false, follow: false } };
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();
  const viewer = await getViewer();
  if (!viewer?.id || viewer.demo || !viewer.verified) {
    redirect(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
  }
  const access = await getCourseAccess(viewer, course.slug);
  if (!access.allowed) {
    return <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm font-semibold text-emerald-700">Your learning pathway</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Connect your course access.</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{access.message}</p>
      <p className="mt-4 leading-7 text-slate-600">Your school administrator can assign the course to your account or cohort.</p>
      <Link className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 font-semibold text-white" href={viewer.mustChangePassword ? "/first-login" : "/dashboard"}>{viewer.mustChangePassword ? "Complete account setup" : "Return to dashboard"}</Link>
    </section>;
  }
  const progress = await getCourseProgress(viewer.id, course.slug);
  const weekTwo = course.slug === "open-guard-mini"
    ? await getDrawerSenseServerProgress(viewer.id, progress)
    : null;
  const query = searchParams ? await searchParams : {};
  return <>
    {query.blocked && <p role="status" className="mx-auto mt-6 max-w-6xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">Finish the earlier checkpoint before opening that lesson. Your next available step is shown below.</p>}
    <CourseLearningPanel
      course={course}
      completedLessonSlugs={progress.records.filter((record) => record.completed).map((record) => record.lesson_slug)}
      databaseReady={progress.databaseReady && (weekTwo?.databaseReady ?? true)}
      weekTwoProgress={weekTwo?.progress}
      weekTwoReady={weekTwo?.weekOneReady ?? false}
      canPreviewAll={viewer.role === "admin" || viewer.role === "teacher"}
      role={viewer.role}
    />
  </>;
}
