import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiViewer: vi.fn(),
  getCourse: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/api-authorization", () => ({ requireApiViewer: mocks.requireApiViewer }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));

const schoolId = "11111111-1111-1111-1111-111111111111";
const course = { slug: "open-guard-mini" };
type QueryBuilder = {
  select: () => QueryBuilder;
  eq: () => QueryBuilder;
  order: () => QueryBuilder;
  insert: (value: unknown) => QueryBuilder;
  delete: () => QueryBuilder;
  maybeSingle: () => unknown;
  single: () => unknown;
  then: (resolve: (value: unknown) => unknown) => Promise<unknown>;
};

function adminMock(responses: Record<string, unknown[]>) {
  const calls: Array<{ table: string; operation: string; value?: unknown }> = [];
  const next = (table: string) => responses[table]?.shift() ?? { data: null, error: null };
  const from = vi.fn((table: string) => {
    const builder = {} as QueryBuilder;
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.order = vi.fn(() => builder);
    builder.insert = vi.fn((value: unknown) => {
      calls.push({ table, operation: "insert", value });
      return builder;
    });
    builder.delete = vi.fn(() => {
      calls.push({ table, operation: "delete" });
      return builder;
    });
    builder.maybeSingle = vi.fn(() => next(table));
    builder.single = vi.fn(() => next(table));
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(next(table)).then(resolve);
    return builder;
  });
  return { client: { from }, calls };
}

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/cohorts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/admin/cohorts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiViewer.mockResolvedValue({ viewer: { id: "admin-1" } });
    mocks.getCourse.mockImplementation((slug: string) => slug === "smart-door-lab" ? course : undefined);
  });

  it("rejects an unsupported course without inserting a cohort", async () => {
    const mock = adminMock({});
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    const response = await POST(request({ schoolId, name: "Year 10", courseSlug: "missing-course", studentSeatLimit: 20 }));

    expect(response.status).toBe(400);
    expect(mock.calls).toEqual([]);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it.each(["pending", "archived"])("rejects a %s school without inserting a cohort", async (status) => {
    const mock = adminMock({ schools: [{ data: { id: schoolId, status }, error: null }] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    const response = await POST(request({ schoolId, name: "Year 10", courseSlug: "smart-door-lab", studentSeatLimit: 20 }));

    expect(response.status).toBe(409);
    expect(mock.calls.some((call) => call.operation === "insert")).toBe(false);
  });

  it("stores the canonical course slug for a supported alias", async () => {
    const mock = adminMock({
      schools: [{ data: { id: schoolId, status: "approved" }, error: null }],
      cohorts: [{ data: { id: "cohort-1", name: "Year 10", course_slug: course.slug, student_seat_limit: 20 }, error: null }],
      cohort_courses: [{ data: null, error: null }],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    const response = await POST(request({ schoolId, name: "Year 10", courseSlug: "smart-door-lab", studentSeatLimit: 20 }));

    expect(response.status).toBe(201);
    expect(mock.calls.filter((call) => call.operation === "insert")).toEqual([
      expect.objectContaining({ table: "cohorts", value: expect.objectContaining({ course_slug: course.slug }) }),
      expect.objectContaining({ table: "cohort_courses", value: expect.objectContaining({ course_slug: course.slug }) }),
    ]);
  });

  it("deletes the cohort when course assignment fails", async () => {
    const mock = adminMock({
      schools: [{ data: { id: schoolId, status: "active" }, error: null }],
      cohorts: [
        { data: { id: "cohort-1", name: "Year 10", course_slug: course.slug, student_seat_limit: 20 }, error: null },
        { data: null, error: null },
      ],
      cohort_courses: [{ data: null, error: { message: "failed" } }],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    const response = await POST(request({ schoolId, name: "Year 10", courseSlug: "smart-door-lab", studentSeatLimit: 20 }));

    expect(response.status).toBe(503);
    expect(mock.calls).toContainEqual({ table: "cohorts", operation: "delete" });
  });
});