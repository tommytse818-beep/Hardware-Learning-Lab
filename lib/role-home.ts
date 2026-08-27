import type { ViewerRole } from "@/lib/viewer";

export function getRoleHome(role: ViewerRole) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/dashboard";
}
