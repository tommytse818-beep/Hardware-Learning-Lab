import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CourseAccessResult } from "./course-access";
import type { Viewer } from "./viewer";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  getViewer: vi.fn(),
  getCourseAccess: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));

const student = {
  id: "student-1",
  role: "student",
  verified: true,
  demo: false,
  mustChangePassword: false,
} as Viewer;
const entitlement = { allowed: true, state: "entitled", message: "Access confirmed." } satisfies CourseAccessResult;

describe("DrawerSense activity access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    mocks.headers.mockResolvedValue(new Headers({ host: "localhost:3000" }));
    mocks.getViewer.mockResolvedValue(null);
    mocks.getCourseAccess.mockResolvedValue({ allowed: false });
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each(["localhost:3000", "127.0.0.1:3000", "[::1]:3000", "localhost"])(
    "requires authentication even on the development host %s",
    async (host) => {
      mocks.headers.mockResolvedValue(new Headers({ host }));
      const { getDrawerSenseAccess } = await import("./drawersense-access");
      await expect(getDrawerSenseAccess()).resolves.toEqual({
        allowed: false, localPreview: false, canReview: false, storageScope: "signed-out",
      });
    },
  );

  it.each(["localhost.example.com", "127.0.0.1.evil", "localhost@evil.com", "school.example.com"])(
    "does not grant development preview to %s",
    async (host) => {
      mocks.headers.mockResolvedValue(new Headers({ host, "x-forwarded-host": "localhost:3000" }));
      const { getDrawerSenseAccess } = await import("./drawersense-access");
      await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: false, localPreview: false, canReview: false });
    },
  );

  it("does not infer localhost from a missing Host header", async () => {
    mocks.headers.mockResolvedValue(new Headers());
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: false, localPreview: false });
  });

  it("does not allow anonymous localhost access in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: false, localPreview: false, canReview: false });
  });

  it("uses the verified student's scope without enabling tutor review", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getViewer.mockResolvedValue(student);
    mocks.getCourseAccess.mockResolvedValue(entitlement);
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toEqual({
      allowed: true, localPreview: false, canReview: false, storageScope: "student-1",
    });
    expect(mocks.getCourseAccess).toHaveBeenCalledWith(student, "open-guard-mini");
  });

  it.each(["teacher", "admin"] as const)("allows a verified entitled %s to review", async (role) => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getViewer.mockResolvedValue({ ...student, role });
    mocks.getCourseAccess.mockResolvedValue(entitlement);
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: true, canReview: true });
  });

  it.each([
    { verified: false }, { demo: true }, { mustChangePassword: true }, { id: null },
  ])("does not trust an incomplete teacher identity: %j", async (change) => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getViewer.mockResolvedValue({ ...student, role: "teacher", ...change });
    mocks.getCourseAccess.mockResolvedValue(entitlement);
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: false, canReview: false });
  });

  it("requires entitlement for a verified teacher", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getViewer.mockResolvedValue({ ...student, role: "teacher" });
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess()).resolves.toMatchObject({ allowed: false, canReview: false });
  });

  it("reuses server-resolved viewer and entitlement instead of fetching them twice", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getDrawerSenseAccess } = await import("./drawersense-access");
    await expect(getDrawerSenseAccess(student, entitlement)).resolves.toMatchObject({ allowed: true });
    expect(mocks.getViewer).not.toHaveBeenCalled();
    expect(mocks.getCourseAccess).not.toHaveBeenCalled();
  });
});
