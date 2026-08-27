import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiViewer: vi.fn(),
  createAdminClient: vi.fn(),
  sendCatchUpReminder: vi.fn(),
}));

vi.mock("@/lib/api-authorization", () => ({ requireApiViewer: mocks.requireApiViewer }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/email", () => ({ sendCatchUpReminder: mocks.sendCatchUpReminder }));

const cohortId = "33333333-3333-3333-3333-333333333333";
const studentId = "44444444-4444-4444-4444-444444444444";
type QueryBuilder = {
  select: () => QueryBuilder;
  eq: () => QueryBuilder;
  maybeSingle: () => unknown;
  update: (value: unknown) => QueryBuilder;
  insert: (value: unknown) => QueryBuilder;
  then: (resolve: (value: unknown) => unknown) => Promise<unknown>;
};

function adminMock(responses: Record<string, unknown[]>, rpcResult?: unknown) {
  const events: Array<{ table?: string; operation: string; value?: unknown }> = [];
  const next = (table: string) => responses[table]?.shift() ?? { data: null, error: null };
  const from = vi.fn((table: string) => {
    const builder = {} as QueryBuilder;
    builder.select = vi.fn(() => { events.push({ table, operation: "select" }); return builder; });
    builder.eq = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(() => next(table));
    builder.update = vi.fn((value: unknown) => { events.push({ table, operation: "update", value }); return builder; });
    builder.insert = vi.fn((value: unknown) => { events.push({ table, operation: "insert", value }); return builder; });
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(next(table)).then(resolve);
    return builder;
  });
  const rpc = vi.fn(async () => rpcResult ?? { data: null, error: null });
  return { client: { from, rpc }, events };
}

function readyResponses() {
  return {
    cohort_memberships: [
      { data: { id: "teacher-membership" }, error: null },
      { data: { id: "student-membership" }, error: null },
    ],
    profiles: [{ data: { email: "student@example.com", display_name: "Student" }, error: null }],
    cohorts: [{ data: { name: "Year 10", active: true }, error: null }],
    cohort_targets: [{ data: { target_lesson_slug: "lesson-1" }, error: null }],
    teacher_reminders: [{ data: null, error: null }],
  };
}

function request() {
  return new Request("http://localhost/api/teacher/reminders", {
    method: "POST",
    body: JSON.stringify({ cohortId, studentId }),
  });
}

describe("POST /api/teacher/reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiViewer.mockResolvedValue({ viewer: { id: "teacher-1" } });
    mocks.sendCatchUpReminder.mockResolvedValue({ ok: true });
  });

  it("returns 403 on membership failure without reserving or emailing", async () => {
    const mock = adminMock({
      cohort_memberships: [
        { data: { id: "teacher-membership" }, error: null },
        { data: null, error: null },
      ],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request())).status).toBe(403);
    expect(mock.client.rpc).not.toHaveBeenCalled();
    expect(mocks.sendCatchUpReminder).not.toHaveBeenCalled();
    expect(mock.events.some((event) => event.table === "teacher_reminders")).toBe(false);
  });

  it("returns 429 when reservation is not allowed without emailing", async () => {
    const mock = adminMock(readyResponses(), { data: { allowed: false, reminder_id: null }, error: null });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { POST } = await import("./route");

    expect((await POST(request())).status).toBe(429);
    expect(mocks.sendCatchUpReminder).not.toHaveBeenCalled();
  });

  it("reserves before emailing and updates the same ID to sent", async () => {
    const mock = adminMock(readyResponses(), { data: { allowed: true, reminder_id: 17 }, error: null });
    mocks.createAdminClient.mockReturnValue(mock.client);
    mocks.sendCatchUpReminder.mockImplementation(async () => {
      mock.events.push({ operation: "email" });
      return { ok: true };
    });
    const { POST } = await import("./route");

    expect((await POST(request())).status).toBe(200);
    expect(mock.events.findIndex((event) => event.operation === "email")).toBeLessThan(
      mock.events.findIndex((event) => event.operation === "update"),
    );
    expect(mock.events).toContainEqual(expect.objectContaining({ table: "teacher_reminders", operation: "update", value: expect.objectContaining({ status: "sent" }) }));
    expect(mock.events.filter((event) => event.table === "teacher_reminders").map((event) => event.operation)).toEqual(["update"]);
  });

  it("updates the same ID to failed and returns 503 when email delivery fails", async () => {
    const mock = adminMock(readyResponses(), { data: { allowed: true, reminder_id: "reminder-9" }, error: null });
    mocks.createAdminClient.mockReturnValue(mock.client);
    mocks.sendCatchUpReminder.mockResolvedValue({ ok: false, errorCode: "email_failed", reason: "provider" });
    const { POST } = await import("./route");

    expect((await POST(request())).status).toBe(503);
    expect(mock.events).toContainEqual(expect.objectContaining({ table: "teacher_reminders", operation: "update", value: expect.objectContaining({ status: "failed", error_code: "email_failed" }) }));
    expect(mock.events.filter((event) => event.table === "teacher_reminders").map((event) => event.operation)).toEqual(["update"]);
  });
});