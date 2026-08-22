import { getCourse } from "@/lib/courses";

export function getPublicCoursePreview(courseSlug: string) {
  const course = getCourse(courseSlug);

  if (!course) {
    return null;
  }

  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessons: course.lessons.slice(0, 3).map((lesson) => ({
      slug: lesson.slug,
      section: lesson.section,
      title: lesson.title,
      summary: lesson.summary,
    })),
  };
}

export function canPublicPreviewCourse(courseSlug: string) {
  return Boolean(getCourse(courseSlug));
}
