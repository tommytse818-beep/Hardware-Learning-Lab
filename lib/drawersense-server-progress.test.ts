import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCourseProgress: vi.fn(), createClient: vi.fn(), createAdminClient: vi.fn(), rpc: vi.fn(), abortRpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/courses", () => ({ getCourse: () => ({ lessons: [
  { slug: "induction", section: "0", humanReviewRequired: true },
  { slug: "first-topic", section: "1.1" },
  { slug: "week-one-checkpoint", section: "1.9", humanReviewRequired: true },
  { slug: "future-week-two", section: "2.2" },
] }) }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/drawersense-curriculum", () => import("./drawersense-curriculum"));
vi.mock("@/lib/drawersense-progress", () => import("./drawersense-progress"));

const weekOne = ["induction", "first-topic", "week-one-checkpoint"].map((lesson_slug) => ({ lesson_slug, completed: true, review_state: "approved", solved_questions: [] }));

function reader(data: unknown[] = [], error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), in: vi.fn(), abortSignal: vi.fn(), order: vi.fn() };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.in.mockReturnValue(query);
  query.abortSignal.mockReturnValue(query);
  query.order.mockResolvedValue({ data, error });
  const from = vi.fn(() => query);
  mocks.createClient.mockResolvedValue({ from });
  return { from, query };
}

describe("authoritative DrawerSense account progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: weekOne });
    reader();
    mocks.createAdminClient.mockReturnValue({ rpc: mocks.rpc });
    mocks.rpc.mockReturnValue({ abortSignal: mocks.abortRpc });
    mocks.abortRpc.mockResolvedValue({ data: [{ correct: true, completed: false, online_ready: false, review_state: "not_started" }], error: null });
  });

  it("does not read progress without an account", async () => {
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    expect(await getDrawerSenseServerProgress(null)).toEqual({ databaseReady: false, weekOneReady: false, blockedBy: null, progress: {} });
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it("requires every earlier lesson and both human approvals", async () => {
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: weekOne.slice(1) });
    expect(await getDrawerSenseServerProgress("student-1")).toMatchObject({ weekOneReady: false, blockedBy: "induction" });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: weekOne.map((item) => item.lesson_slug === "week-one-checkpoint" ? { ...item, review_state: "awaiting_review" } : item) });
    expect(await getDrawerSenseServerProgress("student-1")).toMatchObject({ weekOneReady: false, blockedBy: "week-one-checkpoint" });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: weekOne });
    expect(await getDrawerSenseServerProgress("student-1")).toMatchObject({ databaseReady: true, weekOneReady: true, blockedBy: null });
  });

  it("scopes reads to the authenticated account and restores only persisted steps", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [...weekOne, {
      lesson_slug: "drawer-2-0a", completed: false, review_state: "not_started",
      solved_questions: [{ questionId: "0A1" }, { questionId: "saved-working" }],
    }] });
    const { query } = reader([
      { lesson_slug: "drawer-2-0a", question_id: "saved-working", submitted_answer: { notes: "The drawer resets whenever it closes.", strokes: [], saved: true, reviewed: true, complete: true, correct: ["0A1", "0A2"], override: "old-receipt" } },
      { lesson_slug: "drawer-2-0a", question_id: "0A1", submitted_answer: "1" },
    ]);
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    const result = await getDrawerSenseServerProgress("student-1");
    expect(query.eq).toHaveBeenCalledWith("user_id", "student-1");
    expect(query.eq).toHaveBeenCalledWith("course_slug", "open-guard-mini");
    expect(query.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(result.progress["2.0A"]).toMatchObject({ answers: { "0A1": "1" }, correct: ["0A1"], notes: "The drawer resets whenever it closes.", saved: true, reviewed: false, complete: false });
    expect(result.progress["2.0A"].override).toBeUndefined();
  });

  it("keeps the physical checkpoint incomplete until its review is approved", async () => {
    const record = { lesson_slug: "drawer-2-1f", completed: true, review_state: "awaiting_review", solved_questions: [] };
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [...weekOne, record] });
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    expect((await getDrawerSenseServerProgress("student-1")).progress["2.1F"].complete).toBe(false);
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [...weekOne, { ...record, review_state: "approved" }] });
    expect((await getDrawerSenseServerProgress("student-1")).progress["2.1F"].complete).toBe(true);
  });

  it("restores an online pass independently from physical approval", async () => {
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [...weekOne, {
      lesson_slug: "drawer-2-1f", completed: false, review_state: "awaiting_review",
      solved_questions: ["1F1", "1F2", "saved-working", "solution-comparison", "2.1FT"].map((questionId) => ({ questionId })),
    }] });
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    expect((await getDrawerSenseServerProgress("student-1")).progress["2.1F"]).toMatchObject({ onlineReady: true, complete: false });
  });

  it("can reuse a supplied course-progress read", async () => {
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    const state = await getDrawerSenseServerProgress("student-1", { databaseReady: false, records: [] });
    expect(state.databaseReady).toBe(false);
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it("fails closed if either progress or evidence storage is unavailable", async () => {
    const { getDrawerSenseServerProgress } = await import("./drawersense-server-progress");
    mocks.getCourseProgress.mockResolvedValueOnce({ databaseReady: false, records: [] });
    expect(await getDrawerSenseServerProgress("student-1")).toMatchObject({ databaseReady: false, weekOneReady: false, progress: {} });
    reader([], { message: "unavailable" });
    expect(await getDrawerSenseServerProgress("student-1")).toMatchObject({ databaseReady: false, weekOneReady: false, progress: {} });
  });

  it("writes through the service-only RPC with every required step and no early completion", async () => {
    const { recordDrawerSenseStep } = await import("./drawersense-server-progress");
    await recordDrawerSenseStep("student-1", "2.0A", "0A1", "1", true);
    expect(mocks.rpc).toHaveBeenCalledWith("record_quiz_attempt_v2", {
      p_user_id: "student-1", p_course_slug: "open-guard-mini", p_lesson_slug: "drawer-2-0a", p_question_id: "0A1",
      p_required_question_ids: ["0A1", "0A2", "saved-working", "solution-comparison", "2.0AT"],
      p_human_review_required: false, p_submitted_answer: "1", p_correct: true,
    });
    await recordDrawerSenseStep("student-1", "2.1F", "2.1FT", "1", true);
    expect(mocks.rpc).toHaveBeenLastCalledWith("record_quiz_attempt_v2", expect.objectContaining({ p_lesson_slug: "drawer-2-1f", p_human_review_required: true }));
    expect(mocks.abortRpc).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it("rejects unknown step IDs and never claims an unsuccessful write completed", async () => {
    const { recordDrawerSenseStep } = await import("./drawersense-server-progress");
    await expect(recordDrawerSenseStep("student-1", "2.0A", "forged-step", "1", true)).rejects.toThrow("Invalid activity record");
    expect(mocks.rpc).not.toHaveBeenCalled();
    mocks.abortRpc.mockResolvedValue({ data: null, error: { message: "write failed" } });
    await expect(recordDrawerSenseStep("student-1", "2.0A", "0A1", "1", true)).rejects.toThrow("could not be saved");
  });
});
