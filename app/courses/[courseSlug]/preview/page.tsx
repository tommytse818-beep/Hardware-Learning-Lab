import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCourse } from "@/lib/courses";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Course preview",
  robots: { index: false, follow: false },
};

type CoursePreviewPageProps = {
  params: Promise<{ courseSlug: string }>;
};

export default async function CoursePreviewPage({ params }: CoursePreviewPageProps) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  const viewer = await getViewer();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Public preview
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              {course.title}
            </h1>
          </div>
          {viewer ? (
            <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-950">
              Go to dashboard
            </Link>
          ) : (
            <Link href="/login" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Sign in to unlock full access
            </Link>
          )}
        </div>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          {course.description}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {course.lessons.slice(0, 3).map((lesson) => (
            <div key={lesson.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {lesson.section}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{lesson.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.summary}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          This is a public preview only. Section 1 and later learning checkpoints require a verified school-issued account with active course access.
        </div>
      </div>
    </div>
  );
}
