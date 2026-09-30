import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HllTutorMessage } from "./hll-tutor-message";
const render = (text: string) => renderToStaticMarkup(createElement(HllTutorMessage, { text }));
describe("tutor reply formatting", () => {
  it("renders equations and units instead of raw TeX markup", () => {
    const html = render("Current: \\( I = \\frac{3}{1000} = 0.003\\,\\mathrm{A} \\)");
    expect(html).toContain('class="katex"'); expect(html).toContain("mathml");
  });
  it("does not render model-supplied HTML or remote image requests", () => {
    const html = render('<script>alert(1)</script>\n\n![Circuit](https://tracker.invalid/pixel)');
    expect(html).not.toContain("<script"); expect(html).not.toContain("<img"); expect(html).not.toContain("tracker.invalid");
  });
  it("does not turn invented links or TeX commands into navigation", () => {
    const html = render('[Click](https://bad.invalid) and $\\href{https://bad.invalid}{click}$');
    expect(html).not.toContain("<a "); expect(html).not.toContain('href="https://bad.invalid');
  });
  it("renders useful lists and emphasis", () => {
    const html = render('**Check the givens**\n\n- Supply voltage\n- LED current');
    expect(html).toContain("<strong>Check the givens</strong>"); expect(html).toContain("<ul>");
  });
});
