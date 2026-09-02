import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiViewer: vi.fn(),
  getLesson: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/api-authorization", () => ({ requireApiViewer: mocks.requireApiViewer }));
vi.mock("@/lib/courses", () => ({ getLesson: mocks.getLesson }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));

const studentId = "55555555-5555-5555-5555-555555555555";

type QueryBuilder = {
  select: () => QueryBuilder;
  update: (value: unknown) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, value: unknown) => QueryBuilder;
  maybeSingle: () => unknown;
  then: (resolve: (value: unknown) => unknown) => Promise<unknown>;
};

function adminMock(responses: Record<string, unknown[]>) {
  const calls: Array<{ table: string; operation: string; column?: string; value?: unknown }> = [];
  const next = (table: string) => responses[table]?.shift() ?? { data: null, error: null };
  const from = vi.fn((table: string) => {
    const builder = {} as QueryBuilder;
    builder.select = vi.fn(() => builder);
    builder.update = vi.fn((value: unknown) => {
      calls.push({ table, operation: "update", value });
      return builder;
    });
    builder.eq = vi.fn((column: string, value: unknown) => {
      calls.push({ table, operation: "eq", column, value });
      return builder;
    });
    builder.in = vi.fn((column: string, value: unknown) => {
      calls.push({ table, operation: "in", column, value });
      return builder;
    });
    builder.maybeSingle = vi.fn(() => next(table));
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(next(table)).then(resolve);
    return builder;
  });
  return { client: { from }, calls };
}

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/teacher/lesson-review", {
    method: "POST",
    body: JSON.stringify({
      studentId,
      courseSlug: "open-guard-mini",
      lessonSlug: "induction-readiness",
      decision: "approved",
      ...body,
    }),
  });
}

describe("POST /api/teacher/lesson-review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiViewer.mockResolvedValue({ viewer: { id: "teacher-1", role: "teacher" } });
    mocks.getLesson.mockReturnValue({ slug: "induction-readiness", humanReviewRequired: true });
  });

  it("rejects a teacher who is not assigned to the learner cohort", async () => {
    const mock = adminMock({
      cohort_memberships: [{ data: [{ cohort_id: "cohort-1", role: "teacher" }], error: null }],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({}))).status).toBe(403);
    expect(mock.calls.some((call) => call.table === "lesson_progress")).toBe(false);
  });

  it("lets an assigned teacher approve an awaiting checkpoint", async () => {
    const mock = adminMock({
      cohort_memberships: [
        {
          data: [
            { cohort_id: "cohort-1", role: "teacher" },
            { cohort_id: "cohort-1", role: "student" },
          ],
          error: null,
        },
      ],
      lesson_progress: [{ data: { lesson_slug: "induction-readiness", completed: true, review_state: "approved" }, error: null }],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ feedback: "Ready." }))).status).toBe(200);
    expect(mock.calls).toContainEqual(expect.objectContaining({
      table: "lesson_progress",
      operation: "update",
      value: expect.objectContaining({ completed: true, review_state: "approved", reviewer_id: "teacher-1" }),
    }));
  });

  it("lets an administrator request revision without cohort membership", async () => {
    const mock = adminMock({
      lesson_progress: [{ data: { lesson_slug: "induction-readiness", completed: false, review_state: "revision_requested" }, error: null }],
    });
    mocks.requireApiViewer.mockResolvedValue({ viewer: { id: "admin-1", role: "admin" } });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ decision: "revision_requested", feedback: "Add evidence." }))).status).toBe(200);
    expect(mock.calls).toContainEqual(expect.objectContaining({
      table: "lesson_progress",
      operation: "update",
      value: expect.objectContaining({ completed: false, review_state: "revision_requested", reviewer_id: "admin-1" }),
    }));
  });
});
