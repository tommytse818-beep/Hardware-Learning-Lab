import { describe, expect, it } from "vitest";

import { pointsForFirstCorrectAttempt } from "./quiz-scoring";

describe("pointsForFirstCorrectAttempt", () => {
  it.each([
    [1, 100],
    [2, 50],
    [3, 25],
    [4, 0],
    [12, 0],
  ])("attempt %i awards %i", (attempt, expected) => {
    expect(pointsForFirstCorrectAttempt(attempt)).toBe(expected);
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects invalid attempt %s", (value) => {
    expect(() => pointsForFirstCorrectAttempt(value)).toThrow(RangeError);
  });
});
