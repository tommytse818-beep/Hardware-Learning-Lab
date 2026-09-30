import type { Metadata } from "next";

import { OpenGuardProjectExperience } from "@/components/projects/open-guard-project-experience";
import { getCourseAccess } from "@/lib/course-access";
import { getCourse } from "@/lib/courses";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "DrawerSense Mini",
  description:
    "Explore DrawerSense Mini, a proposed drawer-left-open reminder and three-stage school engineering programme from electronic concepts to PCB design.",
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
      courseSlug={course.slug}
      lessons={lessonSummaries}
    />
  );
}
