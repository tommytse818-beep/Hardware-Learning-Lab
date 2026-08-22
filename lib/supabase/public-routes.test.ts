import { describe, expect, it } from "vitest";

import { isPublicRoute } from "./public-routes";

describe("isPublicRoute", () => {
  it.each(["/", "/about", "/auth/callback", "/api/school-enquiry", "/api/quiz", "/projects/open-guard-mini", "/privacy"]) (
    "allows %s",
    (pathname) => expect(isPublicRoute(pathname)).toBe(true),
  );

  it.each([
    "/dashboard",
    "/courses/open-guard-mini",
    "/api/school-enquiry/other",
  ]) (
    "protects %s",
    (pathname) => expect(isPublicRoute(pathname)).toBe(false),
  );
});