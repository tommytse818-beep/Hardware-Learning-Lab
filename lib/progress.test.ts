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
  then: (resolve: (value: unknown) => unknown) => Promise<unknown>;
};

function clientMock(responses: Record<string, unknown>) {
  return {
    from: vi.fn((table: string) => {
      const builder = {} as QueryBuilder;
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.order = vi.fn(() => builder);
      builder.then = (resolve: (value: unknown) => unknown) =>
        Promise.resolve(responses[table]).then(resolve);
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
});
