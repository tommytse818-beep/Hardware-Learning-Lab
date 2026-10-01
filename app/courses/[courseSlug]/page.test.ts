import { createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCourse: vi.fn(), getViewer: vi.fn(), getCourseAccess: vi.fn(), getCourseProgress: vi.fn(), getDrawerSenseServerProgress: vi.fn(), panel: vi.fn(() => null) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));
vi.mock("@/lib/drawersense-server-progress", () => ({ getDrawerSenseServerProgress: mocks.getDrawerSenseServerProgress }));
vi.mock("@/components/course/course-learning-panel", () => ({ CourseLearningPanel: mocks.panel }));

const course = { slug: "open-guard-mini", title: "DrawerSense Mini", lessons: [] };
const viewer = { id: "student-1", role: "student", verified: true, demo: false, mustChangePassword: false };
const props = { params: Promise.resolve({ courseSlug: course.slug }) };

function panelProps(node: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) return node.map(panelProps).find(Boolean) ?? null;
  if (!isValidElement<Record<string, unknown>>(node)) return null;
  return node.type === mocks.panel ? node.props : panelProps(node.props.children);
}

describe("authenticated course overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourse.mockReturnValue(course);
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [] });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: false, progress: {} });
  });

  it.each([null, { ...viewer, verified: false }, { ...viewer, demo: true }])("redirects anonymous or unverified accounts before loading progress", async (identity) => {
    mocks.getViewer.mockResolvedValue(identity);
    const { default: CoursePage } = await import("./page");
    await expect(CoursePage(props)).rejects.toThrow("REDIRECT:/login?next=%2Fcourses%2Fopen-guard-mini");
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it("does not render course activities or load progress without entitlement", async () => {
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "No active seat." });
    const { default: CoursePage } = await import("./page");
    const page = await CoursePage(props);
    expect(panelProps(page)).toBeNull();
    expect(renderToStaticMarkup(page)).toContain("No active seat.");
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
    expect(mocks.getDrawerSenseServerProgress).not.toHaveBeenCalled();
  });

  it("links unfinished account setup to the existing first-login route", async () => {
    mocks.getViewer.mockResolvedValue({ ...viewer, mustChangePassword: true });
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "Complete account setup." });
    const { default: CoursePage } = await import("./page");
    expect(renderToStaticMarkup(await CoursePage(props))).toContain('href="/first-login"');
  });

  it("keeps students in sequential mode with only server-recorded completions", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [{ lesson_slug: "induction", completed: true }, { lesson_slug: "lesson-1", completed: false }] });
    const { default: CoursePage } = await import("./page");
    expect(panelProps(await CoursePage(props))).toMatchObject({ canPreviewAll: false, completedLessonSlugs: ["induction"], weekTwoReady: false });
  });

  it.each(["teacher", "admin"])("gives a verified entitled %s the teaching view", async (role) => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role });
    const { default: CoursePage } = await import("./page");
    expect(panelProps(await CoursePage(props))).toMatchObject({ canPreviewAll: true, role });
  });

  it("surfaces unavailable progress without manufacturing completion", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: false, records: [] });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: false, weekOneReady: false, progress: {} });
    const { default: CoursePage } = await import("./page");
    expect(panelProps(await CoursePage(props))).toMatchObject({ databaseReady: false, completedLessonSlugs: [], weekTwoReady: false, canPreviewAll: false });
  });
});
