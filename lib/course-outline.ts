import "server-only";

import type { Course } from "./courses";
import { drawerSenseLessons } from "./drawersense-curriculum";

export type PublishedCourseLesson = {
  slug: string;
  section: string;
  title: string;
  humanReviewRequired: boolean;
};

/** A published-only allowlist and safe labels for class targets and review queues. */
export function getPublishedCourseLessons(course: Course | undefined): PublishedCourseLesson[] {
  if (!course) return [];
  const foundation = course.lessons.map((lesson) => ({
    slug: lesson.slug,
    section: lesson.section,
    title: lesson.title,
    humanReviewRequired: lesson.humanReviewRequired === true,
  }));
  if (course.slug !== "open-guard-mini") return foundation;
  return [...foundation, ...drawerSenseLessons.map((lesson) => ({
    slug: `drawer-${lesson.id.toLowerCase().replace(".", "-")}`,
    section: lesson.id,
    title: lesson.title,
    humanReviewRequired: lesson.id === "2.1F",
  }))];
}
