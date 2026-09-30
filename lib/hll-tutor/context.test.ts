import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Viewer } from "../viewer";
const mocks = vi.hoisted(() => ({ access: vi.fn(), progress: vi.fn(), weekTwo: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.access }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.progress }));
vi.mock("@/lib/drawersense-server-progress", () => ({ getDrawerSenseServerProgress: mocks.weekTwo }));
vi.mock("@/lib/courses", () => import("../courses"));
vi.mock("@/lib/drawersense-curriculum", () => import("../drawersense-curriculum"));
vi.mock("@/lib/drawersense-progress", () => import("../drawersense-progress"));
vi.mock("@/lib/drawersense-answer-key", () => ({ getWorkedSolution: () => ["PRIVATE_WORKED_SOLUTION"] }));
vi.mock("@/lib/lesson-readiness", () => import("../lesson-readiness"));
vi.mock("@/lib/hll-tutor-contract", () => import("../hll-tutor-contract"));
import { authorizeTutorContext, tutorInstructions } from "./context";
import { drawerSenseLessons } from "../drawersense-curriculum";
const viewer = { id: "student-1", role: "student" } as Viewer;
const target = (lessonId: string) => ({ courseSlug: "open-guard-mini", lessonId });
describe("authoritative tutor curriculum", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.access.mockResolvedValue({ allowed: true }); mocks.progress.mockResolvedValue({ databaseReady: true, records: [] }); mocks.weekTwo.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: {} }); });
  it("rejects accounts without course access", async () => { mocks.access.mockResolvedValue({ allowed: false }); await expect(authorizeTutorContext(viewer, target("2.0A"))).rejects.toMatchObject({ status: 403 }); });
  it("fails closed when progress is unavailable", async () => { mocks.weekTwo.mockResolvedValue({ databaseReady: false }); await expect(authorizeTutorContext(viewer, target("2.0A"))).rejects.toMatchObject({ status: 503 }); });
  it("requires Week 1 and every earlier Week 2 checkpoint", async () => {
    await expect(authorizeTutorContext(viewer, target("2.1B"))).rejects.toMatchObject({ status: 403 });
    mocks.weekTwo.mockResolvedValue({ databaseReady: true, weekOneReady: false, progress: {} });
    await expect(authorizeTutorContext(viewer, target("2.0A"))).rejects.toMatchObject({ status: 403 });
  });
  it("withholds worked solutions until saved work and all initial checks exist", async () => {
    const first = await authorizeTutorContext(viewer, target("2.0A"));
    expect(first.helpMode).toBe("hint-only"); expect(tutorInstructions(first)).not.toContain("PRIVATE_WORKED_SOLUTION");
    mocks.weekTwo.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: { "2.0A": { saved: true, notes: "My prediction and reasoning for the task.", strokes: [], correct: drawerSenseLessons[0].questions.map((q) => q.id) } } });
    expect(tutorInstructions(await authorizeTutorContext(viewer, target("2.0A")))).toContain("PRIVATE_WORKED_SOLUTION");
  });
  it("lets verified staff inspect published lessons without writing progress", async () => {
    expect((await authorizeTutorContext({ ...viewer, role: "teacher" }, target("2.1F"))).helpMode).toBe("worked-review");
    expect(mocks.weekTwo).not.toHaveBeenCalled();
  });
  it("rejects unpublished Week 2/3 material", async () => { await expect(authorizeTutorContext({ ...viewer, role: "admin" }, target("2.3A"))).rejects.toMatchObject({ status: 404 }); });
  it("keeps Week 1 sequential and excludes quiz answer keys", async () => {
    await expect(authorizeTutorContext(viewer, target("ohms-law-led-resistor"))).rejects.toMatchObject({ status: 403 });
    const result = await authorizeTutorContext(viewer, target("induction-readiness"));
    expect(result.helpMode).toBe("hint-only"); expect(JSON.stringify(result)).not.toContain("correctIndex");
  });
});
