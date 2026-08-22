import { describe, expect, it } from "vitest";

import { parseEngineeringNumber } from "./engineering";

describe("parseEngineeringNumber", () => {
  it.each([
    ["550", 550],
    ["0.55 kOhm", 550],
    ["2.2M", 2200000],
    ["4.7 uF", null],
    ["550 nonsense", null],
    ["", null],
  ])("parses %s", (input, expected) => {
    expect(parseEngineeringNumber(input)).toBe(expected);
  });
});