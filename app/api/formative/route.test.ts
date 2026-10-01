import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCourseAccess: vi.fn(), getCourse: vi.fn(), getLesson: vi.fn(), getFormativeCheck: vi.fn(), parseEngineeringNumber: vi.fn(), getCourseProgress: vi.fn(), getViewer: vi.fn() }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse, getLesson: mocks.getLesson }));
vi.mock("@/lib/formative-checks", () => ({ getFormativeCheck: mocks.getFormativeCheck }));
vi.mock("@/lib/engineering", () => ({ parseEngineeringNumber: mocks.parseEngineeringNumber }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/lesson-readiness", () => ({ getLessonAvailability: () => [{ lessonSlug: "lesson-1", available: true }] }));

const viewer = { id: "student-1", role: "student", verified: true, demo: false, mustChangePassword: false };
function request(body: Record<string, unknown>) { return new Request("http://localhost/api/formative", { method: "POST", body: JSON.stringify({ courseSlug: "course-1", lessonSlug: "lesson-1", questionId: "f1", ...body }) }); }

describe("POST /api/formative", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourse.mockReturnValue({ slug: "course-1", lessons: [{ slug: "lesson-1" }] });
    mocks.getLesson.mockReturnValue({ slug: "lesson-1" });
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [] });
  });

  it("scores a choice without recording completion", async () => {
    mocks.getFormativeCheck.mockReturnValue({ kind: "choice", correctIndex: 1, options: ["No", "Yes"], feedback: "Correct", hint: "Compare endpoints" });
    const { POST } = await import("./route");
    const response = await POST(request({ selectedIndex: 1 }));
    expect(await response.json()).toMatchObject({ correct: true, saved: false, completed: false });
  });

  it("accepts zero only for a nonnegative numeric check", async () => {
    mocks.getFormativeCheck.mockReturnValue({ kind: "numeric", answer: 0, tolerance: 1e-6, domain: "nonnegative", feedback: "Settled to zero", hint: "Follow the decay" });
    mocks.parseEngineeringNumber.mockReturnValue(0);
    const { POST } = await import("./route");
    const response = await POST(request({ numericValue: "0 V" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ correct: true, completed: false });
  });

  it("rejects locked and unentitled access", async () => {
    mocks.getFormativeCheck.mockReturnValue({ kind: "choice", correctIndex: 0, options: ["Yes"], feedback: "Correct", hint: "Hint" });
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "No seat" });
    const { POST } = await import("./route");
    expect((await POST(request({ selectedIndex: 0 }))).status).toBe(403);
  });
});