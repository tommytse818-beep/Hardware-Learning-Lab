import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WeekOneFoundationDiagram } from "./week-one-foundation-diagram";

describe("foundation diagrams", () => {
  it("leaves unrelated sections unchanged", () => {
    expect(WeekOneFoundationDiagram({ sectionHeading: "Unrelated section" })).toBeNull();
  });

  it.each([
    ["Series: one route through both elements", "no third branch"],
    ["Parallel: the same two endpoint nodes", "top node A and bottom node B"],
    ["A capacitor stores separated charge", "An insulator separates them"],
    ["Isolated RC discharge: a separate power-off example", "source disconnected"],
    ["Low-pass: take the output across the capacitor", "output voltage is the voltage across the capacitor"],
    ["High-pass: take the output across the resistor", "output voltage is the voltage across the resistor"],
  ])("provides an accessible circuit description for %s", (sectionHeading, description) => {
    const html = renderToStaticMarkup(createElement(WeekOneFoundationDiagram, { sectionHeading }));
    expect(html).toContain('role="img"');
    expect(html).toContain(description);
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("scroll the diagram sideways");
  });

  it("leaves all output cells blank in the Boolean paper task", () => {
    const html = renderToStaticMarkup(createElement(WeekOneFoundationDiagram, { sectionHeading: "Start with behaviour, not a part number" }));
    expect(html).toContain("A = armed; D = delayed open condition");
    expect(html.match(/aria-label="Your answer"/g)).toHaveLength(4);
    expect(html).not.toContain("Correct answer");
  });
});
