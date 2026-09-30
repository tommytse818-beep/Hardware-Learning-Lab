import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCourseAccess: vi.fn(),
  getCourse: vi.fn(),
  getLesson: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  parseEngineeringNumber: vi.fn(),
  getCourseProgress: vi.fn(),
  createAdminClient: vi.fn(),
  getViewer: vi.fn(),
}));

vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse, getLesson: mocks.getLesson }));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: mocks.isSupabaseConfigured }));
vi.mock("@/lib/engineering", () => ({ parseEngineeringNumber: mocks.parseEngineeringNumber }));
vi.mock("@/lib/lesson-readiness", () => import("../../../lib/lesson-readiness"));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));

const lesson = {
  slug: "user-need-engineering-requirement",
  quiz: {
    kind: "choice",
    id: "q1",
    question: "Question 1",
    options: ["No", "Yes"],
    correctIndex: 1,
    hint: "Hint",
    method: ["Method"],
    explanation: "Explanation",
  },
  microChecks: [
    {
      kind: "choice",
      id: "q1",
      question: "Question 1",
      options: ["No", "Yes"],
      correctIndex: 1,
      hint: "Hint",
      method: ["Method"],
      explanation: "Explanation",
    },
    {
      kind: "choice",
      id: "q2",
      question: "Question 2",
      options: ["No", "Yes"],
      correctIndex: 1,
      hint: "Hint",
      method: ["Method"],
      explanation: "Explanation",
    },
    {
      kind: "choice",
      id: "q3",
      question: "Question 3",
      options: ["No", "Yes"],
      correctIndex: 1,
      hint: "Hint",
      method: ["Method"],
      explanation: "Explanation",
    },
  ],
};
const course = { slug: "open-guard-mini", lessons: [{ slug: "induction" }, { slug: "middle" }, lesson] };
const viewer = { id: "student-1", role: "student", verified: true, demo: false, mustChangePassword: false };

function request(questionId?: string, overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/quiz", {
    method: "POST",
    body: JSON.stringify({
      courseSlug: "open-guard-mini",
      lessonSlug: lesson.slug,
      questionId,
      selectedIndex: 1,
      ...overrides,
    }),
  });
}

function mockRpc(row: Record<string, unknown>) {
  const rpc = vi.fn(async () => ({ data: row, error: null }));
  mocks.createAdminClient.mockReturnValue({ rpc });
  return rpc;
}

describe("POST /api/quiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true, message: "ok" });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [{ lesson_slug: "induction", completed: true }, { lesson_slug: "middle", completed: true }] });
    mocks.getCourse.mockReturnValue(course);
    mocks.getLesson.mockReturnValue(lesson);
    mockRpc({ attempt_number: 1, points_awarded: 100, completed: true, online_ready: true, quiz_score: 100, solved_question_ids: ["q1"], review_state: "online_ready" });
  });

  it("keeps a multi-check lesson incomplete after one correct question", async () => {
    const rpc = mockRpc({
      attempt_number: 1,
      points_awarded: 100,
      correct: true,
      completed: false,
      online_ready: false,
      quiz_score: 0,
      solved_question_ids: ["q1"],
      review_state: "not_started",
    });
    const { POST } = await import("./route");

    const payload = await (await POST(request("q1"))).json();

    expect(payload).toMatchObject({ correct: true, completed: false, quizScore: 0, solvedQuestionIds: ["q1"] });
    expect(rpc).toHaveBeenCalledWith("record_quiz_attempt_v2", expect.objectContaining({
      p_required_question_ids: ["q1", "q2", "q3"],
      p_human_review_required: false,
    }));
  });

  it("completes and returns the aggregate score when the final required answer succeeds", async () => {
    mockRpc({
      attempt_number: 2,
      points_awarded: 50,
      correct: true,
      completed: true,
      online_ready: true,
      quiz_score: 58,
      solved_question_ids: ["q1", "q2", "q3"],
      review_state: "online_ready",
    });
    const { POST } = await import("./route");

    const payload = await (await POST(request("q2"))).json();

    expect(payload).toMatchObject({
      correct: true,
      completed: true,
      onlineReady: true,
      pointsAwarded: 50,
      quizScore: 58,
      solvedQuestionIds: ["q1", "q2", "q3"],
    });
  });

  it("keeps a human-reviewed lesson awaiting review after online preparation", async () => {
    mocks.getLesson.mockReturnValue({ ...lesson, humanReviewRequired: true });
    mockRpc({
      attempt_number: 1,
      points_awarded: 100,
      correct: true,
      completed: false,
      online_ready: true,
      quiz_score: 100,
      solved_question_ids: ["q1", "q2", "q3"],
      review_state: "awaiting_review",
    });
    const { POST } = await import("./route");

    const payload = await (await POST(request("q3"))).json();

    expect(payload).toMatchObject({
      completed: false,
      onlineReady: true,
      reviewState: "awaiting_review",
    });
  });

  it.each(["q1", "lesson-checkpoint", undefined])("resolves a single quiz by its own or legacy ID: %s", async (questionId) => {
    mocks.getLesson.mockReturnValue({ ...lesson, microChecks: undefined });
    const { POST } = await import("./route");
    const response = await POST(request(questionId));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ correct: true, saved: true });
    const rpc = mocks.createAdminClient.mock.results[0].value.rpc;
    expect(rpc).toHaveBeenCalledWith("record_quiz_attempt_v2", expect.objectContaining({ p_question_id: "q1", p_required_question_ids: ["q1"] }));
  });

  it("handles a single numerical checkpoint through the same resolver", async () => {
    mocks.getLesson.mockReturnValue({ ...lesson, microChecks: undefined, quiz: { ...lesson.quiz, id: "resistance", kind: "numeric", answer: 550, tolerance: 1 } });
    mocks.parseEngineeringNumber.mockReturnValue(550);
    const { POST } = await import("./route");
    const response = await POST(request("resistance", { numericValue: "0.55 kΩ" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ correct: true });
  });

  it("rejects a valid question when an earlier prerequisite is unfinished", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [{ lesson_slug: "middle", completed: true }, { lesson_slug: lesson.slug, completed: true }] });
    const { POST } = await import("./route");
    const response = await POST(request("q1"));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ blockedBy: "induction" });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("cannot be bypassed with a client-supplied teacher role or preview flag", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [] });
    const { POST } = await import("./route");
    expect((await POST(request("q1", { role: "teacher", canPreviewAll: true }))).status).toBe(409);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it.each(["teacher", "admin"])("allows a verified entitled %s to review any published lesson", async (role) => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [] });
    const { POST } = await import("./route");
    const response = await POST(request("q1"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ preview: true, saved: false, completed: false, pointsAwarded: 0 });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it.each([
    { ...viewer, verified: false, role: "teacher" },
    { ...viewer, mustChangePassword: true, role: "admin" },
  ])("denies staff previews without verified account setup", async (identity) => {
    mocks.getViewer.mockResolvedValue(identity);
    const { POST } = await import("./route");
    expect((await POST(request("q1"))).status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    mocks.getViewer.mockResolvedValue(null);
    const { POST } = await import("./route");
    expect((await POST(request("q1"))).status).toBe(401);
  });

  it("requires course entitlement", async () => {
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "No active course seat." });
    const { POST } = await import("./route");
    expect((await POST(request("q1"))).status).toBe(403);
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it("keeps the checkpoint locked when progress cannot be read", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: false, records: [] });
    const { POST } = await import("./route");
    expect((await POST(request("q1"))).status).toBe(503);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("returns a recoverable error rather than throwing a database or auth failure", async () => {
    mocks.getViewer.mockRejectedValue(new Error("Network failure"));
    const { POST } = await import("./route");
    const result = await POST(request("q1"));
    expect(result.status).toBe(503);
    expect(await result.json()).not.toHaveProperty("method");
  });

  it.each([null, [], "invalid"])("rejects malformed request bodies", async (body) => {
    const { POST } = await import("./route");
    expect((await POST(new Request("http://localhost/api/quiz", { method: "POST", body: JSON.stringify(body) }))).status).toBe(400);
  });

  it("rejects unknown question IDs without recording an attempt", async () => {
    const { POST } = await import("./route");
    expect((await POST(request("not-a-question"))).status).toBe(404);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("does not reveal worked answers if storage fails", async () => {
    mocks.createAdminClient.mockReturnValue({ rpc: vi.fn(async () => ({ data: null, error: { code: "unavailable" } })) });
    const { POST } = await import("./route");
    const result = await POST(request("q1"));
    expect(result.status).toBe(503);
    expect(await result.json()).not.toHaveProperty("method");
  });
});
