import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ isSupabaseConfigured: mocks.isSupabaseConfigured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

type QueryBuilder = {
  select: () => QueryBuilder;
  eq: () => QueryBuilder;
  order: () => QueryBuilder;
  abortSignal: (signal: AbortSignal) => QueryBuilder;
  then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise<unknown>;
};

function clientMock(responses: Record<string, unknown>) {
  return {
    from: vi.fn((table: string) => {
      const builder = {} as QueryBuilder;
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.order = vi.fn(() => builder);
      builder.abortSignal = vi.fn(() => builder);
      builder.then = (resolve, reject) => Promise.resolve(responses[table]).then(resolve, reject);
      return builder;
    }),
  };
}

describe("getCourseProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
  });

  it("restores solved question IDs and first-correct scores from quiz attempts", async () => {
    const client = clientMock({
      lesson_progress: {
        data: [
          {
            lesson_slug: "lesson-1",
            completed: false,
            quiz_score: 0,
            review_state: "not_started",
            review_feedback: null,
            reviewed_at: null,
          },
        ],
        error: null,
      },
      quiz_attempts: {
        data: [
          { lesson_slug: "lesson-1", question_id: "q1", points_awarded: 100 },
          { lesson_slug: "lesson-1", question_id: "q1", points_awarded: 0 },
          { lesson_slug: "lesson-1", question_id: "q2", points_awarded: 50 },
        ],
        error: null,
      },
    });
    mocks.createClient.mockResolvedValue(client);
    const { getCourseProgress } = await import("./progress");

    await expect(getCourseProgress("student-1", "open-guard-mini")).resolves.toEqual({
      databaseReady: true,
      records: [
        expect.objectContaining({
          lesson_slug: "lesson-1",
          solved_questions: [
            { questionId: "q1", score: 100 },
            { questionId: "q2", score: 50 },
          ],
        }),
      ],
    });
  });

  it("does not query for an anonymous user", async () => {
    const { getCourseProgress } = await import("./progress");
    await expect(getCourseProgress(null, "open-guard-mini")).resolves.toEqual({ databaseReady: false, records: [] });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("does not crash the course page when client initialization rejects", async () => {
    mocks.createClient.mockRejectedValue(new Error("Connection failed"));
    const { getCourseProgress } = await import("./progress");
    await expect(getCourseProgress("student-1", "open-guard-mini")).resolves.toEqual({ databaseReady: false, records: [] });
  });

  it("does not crash the course page when a progress query rejects", async () => {
    mocks.createClient.mockResolvedValue(clientMock({
      lesson_progress: { data: [], error: null },
      quiz_attempts: Promise.reject(new Error("Request aborted")),
    }));
    const { getCourseProgress } = await import("./progress");
    await expect(getCourseProgress("student-1", "open-guard-mini")).resolves.toEqual({ databaseReady: false, records: [] });
  });

  it("fails closed when required review columns are unavailable", async () => {
    mocks.createClient.mockResolvedValue(clientMock({
      lesson_progress: { data: null, error: { code: "42703" } },
      quiz_attempts: { data: [], error: null },
    }));
    const { getCourseProgress } = await import("./progress");
    await expect(getCourseProgress("student-1", "open-guard-mini")).resolves.toEqual({ databaseReady: false, records: [] });
  });

  it("requires recorded human approval for the induction", async () => {
    mocks.createClient.mockResolvedValue(clientMock({
      lesson_progress: { data: [{ lesson_slug: "induction-readiness", completed: true, review_state: "awaiting_review" }], error: null },
      quiz_attempts: { data: [], error: null },
    }));
    const { getCourseProgress } = await import("./progress");
    const result = await getCourseProgress("student-1", "open-guard-mini");
    expect(result.databaseReady).toBe(true);
    expect(result.records[0].completed).toBe(false);
  });

  it("retains an approved induction and applies a timeout to both reads", async () => {
    const client = clientMock({
      lesson_progress: { data: [{ lesson_slug: "induction-readiness", completed: true, review_state: "approved" }], error: null },
      quiz_attempts: { data: [], error: null },
    });
    mocks.createClient.mockResolvedValue(client);
    const { getCourseProgress } = await import("./progress");
    const result = await getCourseProgress("student-1", "open-guard-mini");
    expect(result.records[0].completed).toBe(true);
    for (const query of client.from.mock.results) expect(query.value.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it("ignores malformed rows instead of treating invalid completion flags as true", async () => {
    mocks.createClient.mockResolvedValue(clientMock({
      lesson_progress: { data: [null, { lesson_slug: 5 }, { lesson_slug: "lesson-1", completed: "true" }], error: null },
      quiz_attempts: { data: [null, { question_id: 5 }], error: null },
    }));
    const { getCourseProgress } = await import("./progress");
    const result = await getCourseProgress("student-1", "open-guard-mini");
    expect(result.records).toHaveLength(1);
    expect(result.records[0].completed).toBe(false);
  });
});
