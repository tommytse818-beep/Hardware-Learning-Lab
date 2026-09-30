import { beforeEach, describe, expect, it, vi } from "vitest";

import { drawerSenseLessons } from "../../../../lib/drawersense-curriculum";
import { emptyLessonWork, type LessonWork, type PathwayProgress } from "../../../../lib/drawersense-progress";

const mocks = vi.hoisted(() => ({ getDrawerSenseAccess: vi.fn(), getDrawerSenseServerProgress: vi.fn(), recordDrawerSenseStep: vi.fn() }));
vi.mock("@/lib/drawersense-access", () => ({ getDrawerSenseAccess: mocks.getDrawerSenseAccess }));
vi.mock("@/lib/drawersense-curriculum", () => import("../../../../lib/drawersense-curriculum"));
vi.mock("@/lib/drawersense-answer-key", () => import("../../../../lib/drawersense-answer-key"));
vi.mock("@/lib/drawersense-progress", () => import("../../../../lib/drawersense-progress"));
vi.mock("@/lib/drawersense-server-progress", () => ({
  getDrawerSenseServerProgress: mocks.getDrawerSenseServerProgress,
  recordDrawerSenseStep: mocks.recordDrawerSenseStep,
  DRAWERSENSE_WORK_STEP: "saved-working",
  DRAWERSENSE_REVIEW_STEP: "solution-comparison",
}));
vi.mock("server-only", () => ({}));

const url = "http://localhost:3000/projects/open-guard-mini/checkpoint";
const learnerAccess = { allowed: true, localPreview: false, canReview: false, storageScope: "student-1" };
const readyState = (progress: PathwayProgress = {}) => ({ databaseReady: true, weekOneReady: true, blockedBy: null, progress });

function readyWork(changes: Partial<LessonWork> = {}): LessonWork {
  return {
    ...emptyLessonWork(), answers: { "0A1": "1", "0A2": "0" }, correct: ["0A1", "0A2"],
    notes: "The reminder stays quiet for short openings and resets when the drawer closes.",
    saved: true, ...changes,
  };
}
async function submit(body: unknown, origin = "http://localhost:3000") {
  const { POST } = await import("./route");
  return POST(new Request(url, { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) }));
}

describe("DrawerSense authoritative account checkpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDrawerSenseAccess.mockResolvedValue(learnerAccess);
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState());
    mocks.recordDrawerSenseStep.mockResolvedValue({ completed: false, onlineReady: false, reviewState: "not_started" });
  });

  it("requires course access before reading or writing any account progress", async () => {
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, allowed: false });
    expect((await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1" })).status).toBe(403);
    expect(mocks.getDrawerSenseServerProgress).not.toHaveBeenCalled();
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("rejects a different origin before looking up access", async () => {
    expect((await submit({ lessonId: "2.0A", action: "check" }, "https://other.example")).status).toBe(403);
    expect(mocks.getDrawerSenseAccess).not.toHaveBeenCalled();
  });

  it("keeps Week 2 closed until server-verified Week 1 and human review are complete", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ ...readyState(), weekOneReady: false, blockedBy: "week-one-design-checkpoint" });
    const result = await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1", weekOneReady: true });
    expect(result.status).toBe(409);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("ignores forged browser completion, answers and tutor-preview flags for prior lessons", async () => {
    const result = await submit({ lessonId: "2.0B", action: "check", questionId: "0B1", response: "1", tutorPreview: true, canReview: true, progress: { "2.0A": readyWork({ complete: true, reviewed: true, transfer: "1" }) } });
    expect(result.status).toBe(409);
    expect((await result.json()).error).toContain("2.0A");
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("requires all preceding account records, not just the immediately previous lesson", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0B": readyWork({ complete: true }) }));
    expect((await submit({ lessonId: "2.1A", action: "check", questionId: "1A1", response: "1" })).status).toBe(409);
  });

  it("records a grade against the verified account and returns refreshed progress", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValueOnce(readyState()).mockResolvedValueOnce(readyState({ "2.0A": readyWork({ correct: ["0A1"], saved: false }) }));
    const result = await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1", userId: "other-student", work: readyWork() });
    expect(result.status).toBe(200);
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(mocks.recordDrawerSenseStep).toHaveBeenCalledWith("student-1", "2.0A", "0A1", "1", true);
    expect(await result.json()).toMatchObject({ correct: true, progress: { "2.0A": { correct: ["0A1"] } } });
  });

  it("saves wrong attempts while returning a hint without a solution", async () => {
    const result = await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "0", work: readyWork() });
    expect(await result.json()).toMatchObject({ correct: false, hint: expect.any(String), progress: {} });
    expect(mocks.recordDrawerSenseStep).toHaveBeenCalledWith("student-1", "2.0A", "0A1", "0", false);
  });

  it("does not expose transfer through the initial-check action", async () => {
    expect((await submit({ lessonId: "2.0A", action: "check", questionId: "2.0AT", response: "1" })).status).toBe(400);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it.each([undefined, readyWork({ saved: false }), readyWork({ notes: "", strokes: [] })])(
    "requires a saved prediction before grading initial checks", async (work) => {
      const result = await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1", work });
      expect(result.status).toBe(409);
      expect((await result.json()).error).toContain("prediction");
      expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
    },
  );

  it("does not trust correct answers in a solution request if they were never persisted", async () => {
    const result = await submit({ lessonId: "2.0A", action: "solution", work: readyWork() });
    expect(result.status).toBe(409);
    expect(await result.json()).not.toHaveProperty("solution");
  });

  it.each([readyWork({ saved: false }), readyWork({ notes: "Short", strokes: [] }), readyWork({ notes: "This text is valid evidence but a stroke is not.", strokes: [null] as unknown as LessonWork["strokes"] })])(
    "withholds solutions until the working is valid and saved: %j", async (work) => {
      mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork({ saved: false }) }));
      expect((await submit({ lessonId: "2.0A", action: "solution", work })).status).toBe(409);
      expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
    },
  );

  it("persists submitted working before returning the requested solution", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork({ saved: false }) }));
    const result = await submit({ lessonId: "2.0A", action: "solution", work: readyWork({ complete: true, reviewed: true, override: "old-token" }) });
    expect(result.status).toBe(200);
    expect((await result.json()).solution).toEqual(expect.arrayContaining([expect.stringContaining("20 s")]));
    expect(mocks.recordDrawerSenseStep).toHaveBeenCalledWith("student-1", "2.0A", "saved-working", expect.objectContaining({ saved: true, reviewed: false, complete: false }), true);
    expect(mocks.recordDrawerSenseStep.mock.calls[0][3]).not.toHaveProperty("override");
  });

  it("requires the saved-solution stage before accepting a comparison", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork({ saved: false }) }));
    expect((await submit({ lessonId: "2.0A", action: "review", reviewed: true })).status).toBe(409);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("records an explicit solution comparison", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork() }));
    expect((await submit({ lessonId: "2.0A", action: "review", reviewed: true })).status).toBe(200);
    expect(mocks.recordDrawerSenseStep).toHaveBeenCalledWith("student-1", "2.0A", "solution-comparison", { compared: true }, true);
  });

  it.each([false, "yes", 1, null])("requires an explicit comparison acknowledgement: %j", async (reviewed) => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork() }));
    expect((await submit({ lessonId: "2.0A", action: "review", reviewed })).status).toBe(409);
  });

  it("ignores a forged local comparison flag on transfer", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork({ reviewed: false }) }));
    expect((await submit({ lessonId: "2.0A", action: "transfer", work: readyWork({ reviewed: true }), response: "1" })).status).toBe(409);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("records transfer after the persisted solution comparison", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState({ "2.0A": readyWork({ reviewed: true }) }));
    mocks.recordDrawerSenseStep.mockResolvedValue({ completed: true, onlineReady: true, reviewState: "online_ready" });
    const result = await submit({ lessonId: "2.0A", action: "transfer", response: "1" });
    expect(await result.json()).toMatchObject({ correct: true, completed: true, progress: expect.any(Object) });
    expect(mocks.recordDrawerSenseStep).toHaveBeenCalledWith("student-1", "2.0A", "2.0AT", "1", true);
  });

  it("does not turn the final online pass into physical approval", async () => {
    const progress: PathwayProgress = {};
    for (const lesson of drawerSenseLessons) progress[lesson.id] = readyWork({ correct: lesson.questions.map((question) => question.id), reviewed: true, complete: lesson.id !== "2.1F" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue(readyState(progress));
    mocks.recordDrawerSenseStep.mockResolvedValue({ completed: false, onlineReady: true, reviewState: "awaiting_review" });
    const result = await submit({ lessonId: "2.1F", action: "transfer", response: "1" });
    expect(await result.json()).toMatchObject({ correct: true, completed: false, onlineReady: true, reviewState: "awaiting_review" });
  });

  it("allows authenticated staff to inspect every published solution without granting any completion", async () => {
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, canReview: true, storageScope: "teacher-1" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ ...readyState(), weekOneReady: false });
    const result = await submit({ lessonId: "2.1F", action: "solution", userId: "student-1" });
    expect(result.status).toBe(200);
    expect((await result.json()).solution).toBeInstanceOf(Array);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("staff can inspect initial checks without writing any account progress", async () => {
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, canReview: true, storageScope: "teacher-1" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ ...readyState(), weekOneReady: false });
    expect((await submit({ lessonId: "2.1A", action: "check", questionId: "1A1", response: "1", userId: "student-1" })).status).toBe(200);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("staff can inspect transfer and comparison without any student prerequisites", async () => {
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, canReview: true, storageScope: "teacher-1" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ ...readyState(), weekOneReady: false });
    const transfer = await submit({ lessonId: "2.1D", action: "transfer", response: { value: "0.375", unit: "V", conclusion: "1" } });
    expect(transfer.status).toBe(200);
    expect(await transfer.json()).toMatchObject({ correct: true, preview: true, progress: {} });
    expect((await submit({ lessonId: "2.1D", action: "review", reviewed: true })).status).toBe(200);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("removes the browser override action", async () => {
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, canReview: true });
    expect((await submit({ lessonId: "2.0A", action: "override", reason: "Skip prerequisites", work: readyWork() })).status).toBe(400);
    expect(mocks.recordDrawerSenseStep).not.toHaveBeenCalled();
  });

  it("fails closed for unavailable progress or a failed write", async () => {
    mocks.getDrawerSenseServerProgress.mockResolvedValueOnce({ ...readyState(), databaseReady: false });
    expect((await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1" })).status).toBe(503);
    mocks.recordDrawerSenseStep.mockRejectedValueOnce(new Error("Account save failed."));
    expect((await submit({ lessonId: "2.0A", action: "check", questionId: "0A1", response: "1", work: readyWork() })).status).toBe(503);
  });

  it("returns account progress through authenticated GET only", async () => {
    const { GET } = await import("./route");
    expect(await (await GET()).json()).toEqual(readyState());
    mocks.getDrawerSenseAccess.mockResolvedValue({ ...learnerAccess, allowed: false });
    expect((await GET()).status).toBe(403);
  });
});
