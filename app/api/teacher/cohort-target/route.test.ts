import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiViewer: vi.fn(),
  getLesson: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/api-authorization", () => ({ requireApiViewer: mocks.requireApiViewer }));
vi.mock("@/lib/courses", () => ({ getLesson: mocks.getLesson }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));

const cohortId = "22222222-2222-2222-2222-222222222222";
const lesson = { slug: "user-need-engineering-requirement" };
type QueryBuilder = {
  select: () => QueryBuilder;
  eq: () => QueryBuilder;
  maybeSingle: () => unknown;
  upsert: (value: unknown) => QueryBuilder;
  single: () => unknown;
};

function adminMock(responses: Record<string, unknown[]>) {
  const calls: Array<{ table: string; operation: string; value?: unknown }> = [];
  const next = (table: string) => responses[table]?.shift() ?? { data: null, error: null };
  const from = vi.fn((table: string) => {
    const builder = {} as QueryBuilder;
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(() => next(table));
    builder.upsert = vi.fn((value: unknown) => { calls.push({ table, operation: "upsert", value }); return builder; });
    builder.single = vi.fn(() => next(table));
    return builder;
  });
  return { client: { from }, calls };
}

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/teacher/cohort-target", { method: "POST", body: JSON.stringify(body) });
}

describe("POST /api/teacher/cohort-target", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiViewer.mockResolvedValue({ viewer: { id: "teacher-1" } });
    mocks.getLesson.mockImplementation((courseSlug: string, lessonSlug: string) => courseSlug === "open-guard-mini" && [lesson.slug, "input-process-output"].includes(lessonSlug) ? lesson : undefined);
  });

  it("returns 403 when the teacher is unassigned", async () => {
    const mock = adminMock({ cohort_memberships: [{ data: null, error: null }] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ cohortId, targetLessonSlug: "input-process-output" }))).status).toBe(403);
    expect(mock.calls).toEqual([]);
  });

  it("returns 503 when membership verification fails", async () => {
    const mock = adminMock({ cohort_memberships: [{ data: null, error: { message: "db" } }] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ cohortId, targetLessonSlug: "input-process-output" }))).status).toBe(503);
  });

  it("rejects an inactive cohort without upserting", async () => {
    const mock = adminMock({ cohort_memberships: [{ data: { id: "membership-1" }, error: null }], cohorts: [{ data: null, error: null }] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ cohortId, targetLessonSlug: "input-process-output" }))).status).toBe(409);
    expect(mock.calls).toEqual([]);
  });

  it("rejects a lesson outside the course without upserting", async () => {
    const mock = adminMock({ cohort_memberships: [{ data: { id: "membership-1" }, error: null }], cohorts: [{ data: { course_slug: "open-guard-mini", active: true }, error: null }] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ cohortId, targetLessonSlug: "outside-course" }))).status).toBe(400);
    expect(mock.calls).toEqual([]);
  });

  it("stores the canonical lesson slug for an alias", async () => {
    const mock = adminMock({
      cohort_memberships: [{ data: { id: "membership-1" }, error: null }],
      cohorts: [{ data: { course_slug: "open-guard-mini", active: true }, error: null }],
      cohort_targets: [{ data: { target_lesson_slug: lesson.slug }, error: null }],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request({ cohortId, targetLessonSlug: "input-process-output" }))).status).toBe(200);
    expect(mock.calls[0]).toEqual(expect.objectContaining({ operation: "upsert", value: expect.objectContaining({ target_lesson_slug: lesson.slug }) }));
  });
});