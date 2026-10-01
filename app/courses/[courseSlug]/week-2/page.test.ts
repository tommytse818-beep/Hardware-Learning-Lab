import { createElement, isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCourse: vi.fn(), getViewer: vi.fn(), getCourseAccess: vi.fn(), getDrawerSenseAccess: vi.fn(), getDrawerSenseServerProgress: vi.fn(), getActiveCourseResourceKeys: vi.fn(), pathway: vi.fn(() => null) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/drawersense-access", () => ({ getDrawerSenseAccess: mocks.getDrawerSenseAccess }));
vi.mock("@/lib/drawersense-server-progress", () => ({ getDrawerSenseServerProgress: mocks.getDrawerSenseServerProgress }));
vi.mock("@/lib/course-resources", () => ({ getActiveCourseResourceKeys: mocks.getActiveCourseResourceKeys }));
vi.mock("@/lib/drawersense-media", () => ({
  drawerSenseMediaResources: [],
  getDrawerSenseMediaKeys: (lessonId: string, kind: string) => ({ video: `${lessonId}-${kind}-video`, captions: `${lessonId}-${kind}-captions`, transcript: `${lessonId}-${kind}-transcript` }),
}));
vi.mock("@/lib/drawersense-curriculum", () => ({ drawerSenseLessons: [{ id: "2.0A" }, { id: "2.0B" }, { id: "2.1A" }] }));
vi.mock("@/components/projects/drawersense-pathway", () => ({ DrawerSensePathway: mocks.pathway }));

const viewer = { id: "student-1", role: "student", verified: true, demo: false, mustChangePassword: false };
function props(lesson?: string) { return { params: Promise.resolve({ courseSlug: "open-guard-mini" }), searchParams: Promise.resolve({ lesson }) }; }
function pathwayProps(node: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) return node.map(pathwayProps).find(Boolean) ?? null;
  if (!isValidElement<Record<string, unknown>>(node)) return null;
  return node.type === mocks.pathway ? node.props : pathwayProps(node.props.children);
}

describe("authenticated Week 2 page boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourse.mockReturnValue({ slug: "open-guard-mini" });
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true });
    mocks.getDrawerSenseAccess.mockImplementation(async (identity, entitlement) => ({ allowed: entitlement.allowed, canReview: identity.role === "teacher" || identity.role === "admin" }));
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: {} });
    mocks.getActiveCourseResourceKeys.mockResolvedValue(new Set());
  });

  it.each([null, { ...viewer, demo: true }, { ...viewer, verified: false }])("requires verified authentication even on localhost", async (identity) => {
    mocks.getViewer.mockResolvedValue(identity);
    const { default: WeekTwoPage } = await import("./page");
    await expect(WeekTwoPage(props())).rejects.toThrow("REDIRECT:/login?next=%2Fcourses%2Fopen-guard-mini%2Fweek-2");
    expect(mocks.getDrawerSenseServerProgress).not.toHaveBeenCalled();
  });

  it("keeps activities behind entitlement before reading learner progress", async () => {
    mocks.getCourseAccess.mockResolvedValue({ allowed: false });
    const { default: WeekTwoPage } = await import("./page");
    await expect(WeekTwoPage(props())).rejects.toThrow("REDIRECT:/courses/open-guard-mini");
    expect(mocks.getDrawerSenseServerProgress).not.toHaveBeenCalled();
  });

  it("redirects students until all Week 1 prerequisites pass", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: false, progress: {} });
    const { default: WeekTwoPage } = await import("./page");
    await expect(WeekTwoPage(props())).rejects.toThrow("REDIRECT:/courses/open-guard-mini?blocked=week-2");
  });

  it("cannot skip the first unfinished Week 2 activity by URL", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: { "2.0B": { complete: true } } });
    const { default: WeekTwoPage } = await import("./page");
    await expect(WeekTwoPage(props("2.1A"))).rejects.toThrow("REDIRECT:/courses/open-guard-mini?blocked=2.1A");
  });

  it("starts at the first incomplete activity from server progress", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: { "2.0A": { complete: true } } });
    const { default: WeekTwoPage } = await import("./page");
    expect(pathwayProps(await WeekTwoPage(props()))).toMatchObject({ initialLesson: "2.0B", canReview: false, storageScope: "student-1" });
  });

  it("passes only active published media to the client workspace", async () => {
    mocks.getActiveCourseResourceKeys.mockResolvedValue(new Set(["2.0A-concept-video", "2.0A-concept-captions"]));
    const { default: WeekTwoPage } = await import("./page");
    const media = pathwayProps(await WeekTwoPage(props()))?.media as Record<string, Record<string, unknown>>;
    expect(media["2.0A"].concept).toMatchObject({
      videoSrc: "/api/courses/open-guard-mini/resources/2.0A-concept-video",
      captionsSrc: "/api/courses/open-guard-mini/resources/2.0A-concept-captions",
    });
    expect(media["2.0A"].solution).toBeUndefined();
  });

  it.each(["teacher", "admin"])("opens any published lesson for a verified entitled %s", async (role) => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: false, progress: {} });
    const { default: WeekTwoPage } = await import("./page");
    expect(pathwayProps(await WeekTwoPage(props("2.1A")))).toMatchObject({ initialLesson: "2.1A", canReview: true });
  });

  it("fails closed for students during a progress outage", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: false, weekOneReady: true, progress: {} });
    const { default: WeekTwoPage } = await import("./page");
    await expect(WeekTwoPage(props())).rejects.toThrow("REDIRECT:/courses/open-guard-mini?blocked=week-2");
  });

  it("still lets teachers review published lessons during a progress outage", async () => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role: "teacher" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: false, weekOneReady: false, progress: {} });
    const { default: WeekTwoPage } = await import("./page");
    expect(pathwayProps(await WeekTwoPage(props("2.1A")))).toMatchObject({ initialLesson: "2.1A", canReview: true });
  });
});
