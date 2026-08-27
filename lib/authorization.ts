import { redirect } from "next/navigation";

import { getRoleHome } from "@/lib/role-home";
import { getViewer, type ViewerRole } from "@/lib/viewer";

export async function requireViewerRole(roles: ViewerRole[]) {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
  }

  if (!roles.includes(viewer.role)) {
    redirect(getRoleHome(viewer.role));
  }

  return viewer;
}
