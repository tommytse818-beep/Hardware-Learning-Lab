import { describe, expect, it } from "vitest";
import { captureDrawerSenseDrafts, mergeDrawerSenseDrafts, reconcileDrawerSenseProgress } from "./drawersense-drafts";
import { emptyLessonWork, type LessonWork, type PathwayProgress } from "./drawersense-progress";

const notes = "My switch drawing has one selected contact and a complete return path.";
const work = (change: Partial<LessonWork> = {}): LessonWork => ({ ...emptyLessonWork(), ...change });

describe("account working and explicit browser drafts", () => {
  it("never restores browser completion, comparison, correct-answer or online-pass flags", () => {
    const restored = mergeDrawerSenseDrafts({}, { version: 3, lessons: { "2.0A": {
      working: { notes, strokes: [], ready: true }, answers: { "0A1": "1" },
      correct: ["0A1", "0A2"], complete: true, reviewed: true, onlineReady: true, override: "forged",
    } } });
    expect(restored["2.0A"]).toMatchObject({ notes, saved: true, correct: [], complete: false, reviewed: false });
    expect(restored["2.0A"].onlineReady).toBeFalsy();
    expect(restored["2.0A"].override).toBeUndefined();
  });

  it("does not persist clean account notes that could hide a later update from another device", () => {
    const first: PathwayProgress = { "2.0A": work({ notes, saved: true }) };
    const drafts = captureDrawerSenseDrafts(first, first);
    expect(drafts.lessons).toEqual({});
    const newer = { "2.0A": work({ notes: "A newer corrected explanation from another device.", saved: true }) };
    expect(mergeDrawerSenseDrafts(newer, drafts)["2.0A"].notes).toBe(newer["2.0A"].notes);
  });

  it("ignores legacy whole-account snapshots instead of treating them as dirty drafts", () => {
    const account = { "2.0A": work({ notes: "The current account version of my working.", saved: true }) };
    const legacy = { "2.0A": work({ notes: "An older copied account version.", saved: true, complete: true }) };
    expect(mergeDrawerSenseDrafts(account, legacy)["2.0A"].notes).toBe(account["2.0A"].notes);
    expect(mergeDrawerSenseDrafts(account, legacy)["2.0A"].complete).toBe(false);
  });

  it("preserves local working readiness across an unrelated answer-check response", () => {
    const current = { "2.0A": work({ notes, saved: true, answers: { "0A1": "1" } }) };
    const checked = { "2.0A": work({ correct: ["0A1"], answers: { "0A1": "1" } }) };
    const merged = reconcileDrawerSenseProgress(current, {}, checked);
    expect(merged["2.0A"]).toMatchObject({ notes, saved: true, correct: ["0A1"], reviewed: false, complete: false });
    expect(captureDrawerSenseDrafts(merged, checked).lessons["2.0A"].working?.ready).toBe(true);
  });

  it("clears dirty working once the server confirms the same submission", () => {
    const current = { "2.0A": work({ notes, saved: true }) };
    const confirmed = { "2.0A": work({ notes, saved: true, correct: ["0A1", "0A2"] }) };
    const merged = reconcileDrawerSenseProgress(current, {}, confirmed);
    expect(merged["2.0A"].saved).toBe(true);
    expect(captureDrawerSenseDrafts(merged, confirmed).lessons).toEqual({});
  });

  it("preserves unsaved edits made while a submitted earlier version was being saved", () => {
    const submitted = { "2.0A": work({ notes, saved: true }) };
    const current = { "2.0A": work({ notes: notes + " A later correction.", saved: false }) };
    const merged = reconcileDrawerSenseProgress(current, {}, submitted);
    expect(merged["2.0A"]).toMatchObject({ notes: current["2.0A"].notes, saved: false });
    expect(captureDrawerSenseDrafts(merged, submitted).lessons["2.0A"].working?.ready).toBe(false);
  });

  it("lets saved correct answers and completion win over unfinished browser answers", () => {
    const previous = { "2.0A": work() };
    const current = { "2.0A": work({ answers: { "0A1": "0" }, transfer: "0" }) };
    const confirmed = { "2.0A": work({ answers: { "0A1": "1" }, correct: ["0A1"], transfer: "1", complete: true, onlineReady: true, reviewed: true }) };
    const merged = reconcileDrawerSenseProgress(current, previous, confirmed);
    expect(merged["2.0A"]).toMatchObject({ answers: { "0A1": "1" }, transfer: "1", complete: true, onlineReady: true, reviewed: true });
    expect(captureDrawerSenseDrafts(merged, confirmed).lessons).toEqual({});
  });

  it("sanitizes dirty drawing coordinates and validates local readiness", () => {
    const merged = mergeDrawerSenseDrafts({}, { version: 3, lessons: { "2.0A": {
      working: { notes: "short", strokes: [[['0" injection', 2], [4, 2]]], ready: true },
    } } });
    expect(merged["2.0A"].strokes).toEqual([[[4, 2]]]);
    expect(merged["2.0A"].saved).toBe(false);
  });
});
