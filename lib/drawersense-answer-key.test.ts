import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { gradeQuestion, getWorkedSolution } from "./drawersense-answer-key";
import { getDrawerSenseLesson, type LessonId } from "./drawersense-curriculum";

describe("DrawerSense number and unit grading", () => {
  it.each([
    ["2.1B", "1B1", "3", "V"],
    ["2.1B", "1B1", "3000", "mV"],
    ["2.1B", "1B2", "5", "mA"],
    ["2.1B", "1B2", "0.005", "A"],
    ["2.1B", "1B2", "5e3", "uA"],
    ["2.1B", "2.1BT", "3", "V"],
    ["2.1D", "1D1", "66.7", "uF"],
    ["2.1D", "1D1", "6.67e-5", "F"],
    ["2.1D", "1D1", "66700", "nF"],
    ["2.1D", "1D2", "0.25", "V"],
    ["2.1D", "1D2", "250", "mV"],
    ["2.1E", "1E1", "3", "mA"],
    ["2.1E", "1E1", "0.003", "A"],
    ["2.1E", "1E2", "0.10", "s"],
    ["2.1E", "1E2", "100", "ms"],
  ])("accepts equivalent units for %s / %s: %s %s", (lessonId, questionId, value, unit) => {
    expect(gradeQuestion(lessonId as LessonId, questionId, { value, unit })).toEqual({ correct: true });
  });

  it("accepts the stated 2–3 significant-figure rounding without accepting a wrong magnitude", () => {
    expect(gradeQuestion("2.1D", "1D1", { value: "67", unit: "uF" })).toEqual({ correct: true });
    expect(gradeQuestion("2.1D", "1D1", { value: "66.67", unit: "uF" })).toEqual({ correct: true });
    for (const value of ["6.67", "66", "68", "667"]) {
      expect(gradeQuestion("2.1D", "1D1", { value, unit: "uF" }).correct).toBe(false);
    }
  });

  it("keeps the numerical rounding allowance separate from component tolerance", () => {
    expect(gradeQuestion("2.1D", "1D2", { value: ".2504", unit: "V" }).correct).toBe(true);
    expect(gradeQuestion("2.1D", "1D2", { value: ".251", unit: "V" }).correct).toBe(false);
    expect(gradeQuestion("2.1D", "1D2", { value: ".20", unit: "V" }).correct).toBe(false);
  });

  it.each(["", " ", "NaN", "Infinity", "-Infinity", "1e999", "3 mA", "3junk", "0x3", "3,0", "3/1", "0", "-3"])(
    "rejects invalid or nonphysical numerical input %j",
    (value) => {
      expect(gradeQuestion("2.1E", "1E1", { value, unit: "mA" })).toMatchObject({
        correct: false,
        hint: expect.any(String),
      });
    },
  );

  it("rejects wrong dimensions, mismatched scales and client-supplied conversion factors", () => {
    expect(gradeQuestion("2.1E", "1E1", { value: "3", unit: "V" }).correct).toBe(false);
    expect(gradeQuestion("2.1E", "1E1", { value: "3", unit: "A" }).correct).toBe(false);
    expect(gradeQuestion("2.1E", "1E1", { value: "3", unit: "A", multiplier: 0.001 }).correct).toBe(false);
  });

  it.each([null, [], "3mA", 3, { value: 3, unit: "mA" }, { value: "3" }])(
    "requires a typed number-and-unit response: %j",
    (response) => {
      expect(gradeQuestion("2.1E", "1E1", response).correct).toBe(false);
    },
  );
});

describe("DrawerSense transfer interpretation", () => {
  it.each([
    { value: "0.375", unit: "V", conclusion: "1" },
    { value: "375", unit: "mV", conclusion: "1" },
  ])("requires the stronger pulse calculation and its correct interpretation: %j", (response) => {
    expect(gradeQuestion("2.1D", "2.1DT", response)).toEqual({ correct: true });
  });

  it.each([undefined, "0", "2", "Above the 0.30 V limit", 1, true])(
    "does not pass a correct number with a missing or wrong interpretation: %j",
    (conclusion) => {
      expect(gradeQuestion("2.1D", "2.1DT", { value: "375", unit: "mV", conclusion })).toEqual({
        correct: false,
        hint: expect.stringContaining("numerical result is correct"),
      });
    },
  );

  it("checks the number before offering interpretation feedback", () => {
    const result = gradeQuestion("2.1D", "2.1DT", { value: "0.25", unit: "V", conclusion: "1" });
    expect(result.correct).toBe(false);
    expect(result.hint).not.toContain("numerical result is correct");
  });

  it("keeps the transfer result and answer index out of the initial walkthrough and student question", () => {
    const walkthrough = getWorkedSolution("2.1D").join(" ");
    expect(walkthrough).toContain("0.25 V");
    expect(walkthrough).not.toMatch(/0\.375|375\s*mV/);
    const transfer = getDrawerSenseLesson("2.1D")!.transfer;
    expect(transfer.conclusion?.choices).toEqual(["Within the 0.30 V limit", "Above the 0.30 V limit"]);
    expect(transfer).not.toHaveProperty("answer");
    expect(transfer).not.toHaveProperty("conclusionIndex");
    expect(transfer.conclusion).not.toHaveProperty("correctIndex");
  });
});
