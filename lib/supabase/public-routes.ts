const publicExactRoutes = new Set([
  "/",
  "/about",
  "/projects",
  "/schools",
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/accessibility",
  "/safeguarding",
]);

export function isPublicRoute(pathname: string) {
  return (
    publicExactRoutes.has(pathname) ||
    pathname.startsWith("/projects/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/api/quiz" ||
    pathname === "/api/school-enquiry"
  );
}