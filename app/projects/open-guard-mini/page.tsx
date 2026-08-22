import type { Metadata } from "next";

import { OpenGuardProjectExperience } from "@/components/projects/open-guard-project-experience";
import { getCourseAccess } from "@/lib/course-access";
import { getCourse } from "@/lib/courses";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "OpenGuard Mini",
  description:
    "Explore OpenGuard Mini, Hardware Learning Lab's first Smart Living school workshop: a removable low-voltage door, locker or drawer opening alert and electronics design pathway.",
};

export default async function OpenGuardMiniProjectPage() {
  const course = getCourse("open-guard-mini");

  if (!course) {
    return null;
  }

  const viewer = await getViewer();
  const access = await getCourseAccess(viewer, course.slug);
  const lessonSummaries = course.lessons.map((lesson) => ({
    slug: lesson.slug,
    section: lesson.section,
    title: lesson.title,
    duration: lesson.duration,
    delivery: lesson.delivery,
    summary: lesson.summary,
  }));

  return (
    <OpenGuardProjectExperience
      access={access}
      signedIn={Boolean(viewer && !viewer.demo)}
      courseSlug={course.slug}
      lessons={lessonSummaries}
    />
  );
}
