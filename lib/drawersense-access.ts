import { getCourseAccess, type CourseAccessResult } from "@/lib/course-access";
import { getViewer, type Viewer } from "@/lib/viewer";

export type DrawerSenseAccess = {
  allowed: boolean;
  localPreview: boolean;
  canReview: boolean;
  storageScope: string;
};

/** All environments require a verified, entitled account. Staff may inspect content. */
export async function getDrawerSenseAccess(
  existingViewer?: Viewer | null,
  existingAccess?: CourseAccessResult,
): Promise<DrawerSenseAccess> {
  const viewer = existingViewer === undefined ? await getViewer() : existingViewer;
  const access = existingAccess ?? await getCourseAccess(viewer, "open-guard-mini");
  const entitled = Boolean(
    viewer?.id && viewer.verified && !viewer.demo && !viewer.mustChangePassword && access.allowed,
  );

  return {
    allowed: entitled,
    localPreview: false,
    canReview: entitled && (viewer?.role === "admin" || viewer?.role === "teacher"),
    storageScope: viewer?.id ?? "signed-out",
  };
}
