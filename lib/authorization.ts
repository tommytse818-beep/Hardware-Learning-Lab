import { redirect } from "next/navigation";

import { getViewer } from "@/lib/viewer";

export async function requireViewerRole(roles: Array<"admin" | "teacher" | "student">) {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (!roles.includes(viewer.role)) {
    redirect("/dashboard");
  }

  return viewer;
}
