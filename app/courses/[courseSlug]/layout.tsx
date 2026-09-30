import type { ReactNode } from "react";
import { HllTutorWorkspace } from "@/components/hll-tutor-panel";
import { getViewer } from "@/lib/viewer";
import { getCourseAccess } from "@/lib/course-access";

export default async function CourseLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const viewer = await getViewer();
  const access = await getCourseAccess(viewer, courseSlug);
  // Page and API authorization remain authoritative; this only mounts the UI.
  if (!access.allowed) return children;
  return <HllTutorWorkspace>{children}</HllTutorWorkspace>;
}
