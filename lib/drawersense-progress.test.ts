import { describe, expect, it } from "vitest";

import { emptyLessonWork, hasWork, sanitizeProgress } from "./drawersense-progress";

const sketch = [[0, 0], [100, 25], [200, 40], [210, 60], [250, 90]];
const notes = "The switch connects the rail to one contact at a time.";

describe("DrawerSense saved-work restoration", () => {
  it.each([undefined, null, false, 17, "saved", []])("ignores invalid root data: %j", (value) => {
    expect(sanitizeProgress(value)).toEqual({});
  });

  it("restores known lessons and responses without preserving unexpected fields", () => {
    const progress = sanitizeProgress({
      "2.0A": {
        ...emptyLessonWork(), notes, strokes: [sketch], saved: true, reviewed: true, complete: true,
        answers: { "0A1": "1", "0A2": "0", other: "payload" },
        correct: ["0A1", "0A1", "0A2", "2.0AT", "unknown", 3], transfer: "1", extra: "discard",
      },
      unknown: { notes }, "2.0B": null,
    });
    expect(Object.keys(progress)).toEqual(["2.0A"]);
    expect(progress["2.0A"]).toEqual({
      answers: { "0A1": "1", "0A2": "0" }, correct: ["0A1", "0A2"], transfer: "1",
      notes, strokes: [sketch], saved: true, reviewed: true, complete: true, onlineReady: false,
    });
  });

  it("drops attribute-injection coordinates and malformed strokes, and bounds numeric coordinates", () => {
    const progress = sanitizeProgress({ "2.0A": { strokes: [
      null, "not an array", [[0, 0], ['0" data-review-proof="yes', 1], [2, Infinity], [NaN, 0], [1], [1, 2, 3], [-10, 900], [1e100, -1e100]],
    ] } });
    expect(progress["2.0A"].strokes).toEqual([[[0, 0], [0, 320], [720, 0]]]);
    const exportedPoints = progress["2.0A"].strokes.flatMap((stroke) => stroke.map((point) => point.join(","))).join(" ");
    expect(exportedPoints).not.toContain('"');
    expect(exportedPoints).not.toContain("data-review-proof");
  });

  it("rejects wrong response types, out-of-range choices and units from another quantity", () => {
    const progress = sanitizeProgress({
      "2.0A": { answers: { "0A1": 1, "0A2": "3" }, transfer: { value: "1", unit: "V" } },
      "2.1B": { answers: { "1B1": { value: "3", unit: "A" }, "1B2": { value: 5, unit: "mA" } }, transfer: { value: "3000", unit: "mV", multiplier: 99 } },
      "2.1D": { answers: { "1D1": { value: "6.67e", unit: "uF", extra: "discard" } } },
    });
    expect(progress["2.0A"].answers).toEqual({});
    expect(progress["2.0A"].transfer).toBeUndefined();
    expect(progress["2.1B"].answers).toEqual({});
    expect(progress["2.1B"].transfer).toEqual({ value: "3000", unit: "mV" });
    expect(progress["2.1D"].answers["1D1"]).toEqual({ value: "6.67e", unit: "uF" });
  });

  it("caps stored text and drawings and treats only true booleans as true", () => {
    const progress = sanitizeProgress({ "2.1B": {
      notes: "x".repeat(13000), overrideReason: "r".repeat(1200), override: "t".repeat(4001),
      strokes: Array.from({ length: 205 }, () => Array.from({ length: 2005 }, () => [1, 2])),
      answers: { "1B1": { value: "1".repeat(45), unit: "V" } },
      saved: "true", reviewed: 1, complete: {},
    } });
    const work = progress["2.1B"];
    expect(work.notes).toHaveLength(12000);
    expect(work.overrideReason).toHaveLength(1000);
    expect(work.override).toBeUndefined();
    expect(work.strokes).toHaveLength(200);
    expect(work.strokes.every((stroke) => stroke.length === 2000)).toBe(true);
    expect(work.answers["1B1"]).toEqual({ value: "1".repeat(40), unit: "V" });
    expect([work.saved, work.reviewed, work.complete]).toEqual([false, false, false]);
  });

  it("preserves only conclusion choices belonging to the numeric question", () => {
    const valid = sanitizeProgress({
      "2.1D": { transfer: { value: "0.375", unit: "V", conclusion: "1" } },
      "2.1B": { transfer: { value: "3", unit: "V", conclusion: "1" } },
    });
    expect(valid["2.1D"].transfer).toEqual({ value: "0.375", unit: "V", conclusion: "1" });
    expect(valid["2.1B"].transfer).toEqual({ value: "3", unit: "V" });
    for (const conclusion of [1, "7", "<script>", null]) {
      expect(sanitizeProgress({ "2.1D": { transfer: { value: "0.375", unit: "V", conclusion } } })["2.1D"].transfer)
        .toEqual({ value: "0.375", unit: "V" });
    }
  });

  it("keeps bounded receipt data without claiming it is verified", () => {
    expect(sanitizeProgress({ "2.0A": { override: "unverified-receipt", overrideReason: notes } })["2.0A"])
      .toMatchObject({ override: "unverified-receipt", overrideReason: notes, complete: false });
  });
});

describe("DrawerSense working evidence", () => {
  it("accepts saved written or drawing attempts for subsequent human review", () => {
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes })).toBe(true);
    expect(hasWork({ ...emptyLessonWork(), saved: true, strokes: [sketch] })).toBe(true);
    expect(hasWork({ ...emptyLessonWork(), notes })).toBe(false);
    expect(hasWork({ ...emptyLessonWork(), saved: true, strokes: [[[0, 0], [1, 1]]] })).toBe(false);
  });

  it.each([null, "bad", [[1, "2"]], [[Infinity, 0]], [[-1, 0]], [[721, 0]], [[0, 321]]])(
    "rejects every malformed stroke even alongside valid notes and another valid stroke: %j", (badStroke) => {
      expect(hasWork({ ...emptyLessonWork(), saved: true, notes, strokes: [sketch, badStroke] })).toBe(false);
    },
  );

  it("rejects oversized evidence rather than silently certifying it", () => {
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes: "x".repeat(12001) })).toBe(false);
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes, strokes: Array.from({ length: 201 }, () => sketch) })).toBe(false);
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes, strokes: [Array.from({ length: 2001 }, () => [1, 2])] })).toBe(false);
  });

  it("rejects sparse coordinate and stroke arrays", () => {
    expect(sanitizeProgress({ "2.0A": { strokes: [[Array(2)]] } })["2.0A"].strokes).toEqual([]);
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes, strokes: [Array(5)] })).toBe(false);
    expect(hasWork({ ...emptyLessonWork(), saved: true, notes, strokes: Array(2) })).toBe(false);
  });
});
