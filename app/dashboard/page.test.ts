import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCourse } from "../../lib/courses";
import { getPublishedCourseLessons } from "../../lib/course-outline";

const mocks = vi.hoisted(() => ({ getViewer: vi.fn(), getCourseAccess: vi.fn(), getCourseProgress: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/status-banner", () => ({ StatusBanner: () => null }));
vi.mock("@/lib/courses", () => import("../../lib/courses"));
vi.mock("@/lib/course-outline", () => import("../../lib/course-outline"));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));

const viewer = { id: "student-1", verified: true, demo: false, role: "student", displayName: "Student", email: "student@example.test", mustChangePassword: false };
const published = getPublishedCourseLessons(getCourse("open-guard-mini"));
const props = { searchParams: Promise.resolve({}) };
function records() { return published.map((lesson) => ({ lesson_slug: lesson.slug, completed: true, review_state: "approved" })); }
async function render() {
  const { default: DashboardPage } = await import("./page");
  return renderToStaticMarkup(await DashboardPage(props));
}

describe("student dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true, state: "active" });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: records() });
  });

  it.each([null, { ...viewer, id: null }, { ...viewer, verified: false }, { ...viewer, demo: true }])("requires a verified real account", async (identity) => {
    mocks.getViewer.mockResolvedValue(identity);
    await expect(render()).rejects.toThrow("REDIRECT:/login");
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it.each([["admin", "/admin"], ["teacher", "/teacher"]])("routes verified %s accounts to their portal", async (role, url) => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role });
    await expect(render()).rejects.toThrow(`REDIRECT:${url}`);
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it("requires first login setup before loading course progress", async () => {
    mocks.getViewer.mockResolvedValue({ ...viewer, mustChangePassword: true });
    await expect(render()).rejects.toThrow("REDIRECT:/first-login");
  });

  it("counts all published checkpoints and continues to the unified course panel", async () => {
    const html = await render();
    expect(html).toContain("18/18 checkpoints");
    expect(html).toContain("DrawerSense Mini");
    expect(html).toContain("8 activities published");
    expect(html).toContain("Sections 2.2–2.6");
    expect(html).toMatch(/href="\/courses\/open-guard-mini"[^>]*>Continue course/);
    expect(html).not.toContain("/lessons/induction-readiness");
    expect(html).not.toContain("OpenGuard");
  });

  it("waits for final human approval before counting the last checkpoint", async () => {
    const saved = records();
    saved.at(-1)!.review_state = "awaiting_review";
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: saved });
    expect(await render()).toContain("17/18 checkpoints");
  });

  it("does not count later completions past a missing predecessor", async () => {
    const saved = records();
    saved[2].completed = false;
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: saved });
    expect(await render()).toContain("2/18 checkpoints");
  });

  it("reports unavailable progress without implying completion or unlocked lessons", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: false, records: records() });
    const html = await render();
    expect(html).toContain("Temporarily unavailable");
    expect(html).toContain("later lessons stay locked");
    expect(html).not.toContain("18/18 checkpoints");
  });

  it("does not load student progress without course access", async () => {
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "No active seat." });
    const html = await render();
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
    expect(html).toContain("No active seat.");
    expect(html).toContain("Course access required");
  });
});
