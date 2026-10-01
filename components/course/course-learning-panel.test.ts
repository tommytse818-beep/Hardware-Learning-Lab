import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./course-learning-panel.tsx", import.meta.url), "utf8");

describe("planned course roadmap", () => {
  it("keeps future instruction staff-only and planned", () => {
    expect(source).toContain("canPreviewAll && <>");
    expect(source).toContain("Staff outline:");
    expect(source).toContain("Evidence gate:");
    expect(source).toContain("Planned · not published");
  });

  it("keeps schematic capture before PCB layout", () => {
    expect(source.indexOf('title: "Capture the full schematic"')).toBeLessThan(source.indexOf('title: "Place and route the PCB"'));
  });
});