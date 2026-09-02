import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCourseAccessForUser: vi.fn(),
  getCourse: vi.fn(),
  getLesson: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  parseEngineeringNumber: vi.fn(),
  getRequiredQuestionIds: vi.fn(),
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/lib/course-access", () => ({ getCourseAccessForUser: mocks.getCourseAccessForUser }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse, getLesson: mocks.getLesson }));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: mocks.isSupabaseConfigured }));
vi.mock("@/lib/engineering", () => ({ parseEngineeringNumber: mocks.parseEngineeringNumber }));
vi.mock("@/lib/lesson-readiness", () => ({ getRequiredQuestionIds: mocks.getRequiredQuestionIds }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

const course = { slug: "open-guard-mini" };
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

function request(questionId: string) {
  return new Request("http://localhost/api/quiz", {
    method: "POST",
    body: JSON.stringify({
      courseSlug: "open-guard-mini",
      lessonSlug: lesson.slug,
      questionId,
      selectedIndex: 1,
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
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "student-1" } } })) },
    });
    mocks.getCourseAccessForUser.mockResolvedValue({ allowed: true, message: "ok" });
    mocks.getCourse.mockReturnValue(course);
    mocks.getLesson.mockReturnValue(lesson);
    mocks.getRequiredQuestionIds.mockReturnValue(["q1", "q2", "q3"]);
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
});
