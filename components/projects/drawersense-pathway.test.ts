import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./drawersense-pathway.tsx", import.meta.url), "utf8");

describe("DrawerSense teaching sequence", () => {
  it("teaches and rehearses before showing the assessed prediction", () => {
    const learnStage = source.slice(source.indexOf('{stage==="learn"'), source.indexOf('{stage==="practice"'));
    expect(learnStage.indexOf("<ConceptSequence")).toBeLessThan(learnStage.indexOf("<AnalogousRehearsal"));
    expect(learnStage.indexOf("<AnalogousRehearsal")).toBeLessThan(learnStage.indexOf("<DrawerSenseTaskDiagram"));
    expect(learnStage.indexOf("<DrawerSenseTaskDiagram")).toBeLessThan(learnStage.indexOf("PAUSE & PREDICT"));
  });

  it("keeps recovery help non-certifying and separate from the exact solution", () => {
    expect(source).toContain("This help does not complete the activity or reveal its worked solution");
    expect(source).toContain("open={hasIncorrectAttempt}");
  });

  it("does not import the answer-bearing client diagram module", () => {
    expect(source).not.toContain('from "@/components/projects/drawersense-diagram"');
    expect(source).toContain("setWorkedDiagram(result.diagram ?? null)");
  });
});