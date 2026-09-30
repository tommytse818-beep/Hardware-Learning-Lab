// Run explicitly: node --env-file=.env.local scripts/evaluate-hll-model.mjs
// Uses synthetic text cases only. It does not certify vision or student readiness.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { tutorInstructions } from "../lib/hll-tutor/instructions.ts";
import { getLesson } from "../lib/courses.ts";

if (process.env.HLL_TUTOR_ENABLED !== "true") throw new Error("Enable the self-hosted teacher pilot first.");
const base = new URL(process.env.HLL_TUTOR_BASE_URL);
if (!base.pathname.endsWith("/")) base.pathname += "/";
const local = ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname);
if (base.username || base.password || base.search || base.hash || (!local && (base.protocol !== "https:" || !process.env.HLL_TUTOR_API_KEY)) || !["http:", "https:"].includes(base.protocol)) throw new Error("Use a configured local or authenticated HTTPS model server.");
const model = process.env.HLL_TUTOR_MODEL;
if (!model || /cloud/i.test(model)) throw new Error("Choose a self-hosted model.");
const suite = JSON.parse(await readFile(new URL("../evaluation/hll-tutor-cases.json", import.meta.url), "utf8"));
const lessonIds = { "units-ohm": "ohms-law-led-resistor", "missing-givens": "ohms-law-led-resistor", "shared-nodes": "voltage-current-resistance", "pull-up": "pull-resistors-floating-input", "image-uncertain": "safety-complete-circuit", "switch-orientation": "safety-complete-circuit", "rc-discharge": "pull-resistors-floating-input", "filter-output": "pull-resistors-floating-input", "different-givens": "pull-resistors-floating-input", "checkpoint-hint": "ohms-law-led-resistor", "diagram-injection": "safety-complete-circuit", "course-boundary": "induction-readiness" };
const selected = process.argv[2] ? suite.cases.filter((item) => item.id === process.argv[2]) : suite.cases;
if (!selected.length) throw new Error("Unknown evaluation case.");
const results = [];
for (const item of selected) {
  const lesson = getLesson("open-guard-mini", lessonIds[item.id]);
  const context = { lesson: { courseSlug: "open-guard-mini", lessonId: lesson.slug, title: lesson.title }, stage: item.stage,
    helpMode: item.stage === "practice" ? "hint-only" : "worked-review",
    approvedTeaching: [{ sourceId: lesson.slug, text: [lesson.summary, ...lesson.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])])].join("\n") }] };
  const started = performance.now();
  try {
    const response = await fetch(new URL("chat/completions", base), { method: "POST", redirect: "error", signal: AbortSignal.timeout(90_000),
      headers: { "Content-Type": "application/json", ...(process.env.HLL_TUTOR_API_KEY ? { Authorization: `Bearer ${process.env.HLL_TUTOR_API_KEY}` } : {}) },
      body: JSON.stringify({ model, stream: false, temperature: 0.2, max_tokens: 650, ...(process.env.HLL_TUTOR_REASONING_EFFORT ? { reasoning_effort: process.env.HLL_TUTOR_REASONING_EFFORT } : {}), messages: [{ role: "system", content: tutorInstructions(context) }, { role: "user", content: item.question }] }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    const choice = body.choices?.[0];
    results.push({ id: item.id, milliseconds: Math.round(performance.now() - started), transportComplete: choice?.finish_reason === "stop", finishReason: choice?.finish_reason, reply: choice?.message?.content, usage: body.usage,
      mustInclude: item.mustInclude, mustAvoid: item.mustAvoid, teacherVerdict: "NOT_REVIEWED" });
  } catch { results.push({ id: item.id, milliseconds: Math.round(performance.now() - started), transportComplete: false, error: "Inference failed or timed out", teacherVerdict: "NOT_REVIEWED" }); }
  console.log(`${item.id}: ${results.at(-1).transportComplete ? "reply saved for review" : "inference incomplete"}`);
}
await mkdir(new URL("../outputs/hll-model-evaluation/", import.meta.url), { recursive: true });
const output = new URL(`../outputs/hll-model-evaluation/${new Date().toISOString().replaceAll(":", "-")}.json`, import.meta.url);
await writeFile(output, JSON.stringify({ model, scope: "Synthetic text evaluation; no image upload or student data. Accuracy requires human review. This script tests prompts/model; API access controls are tested separately.", results }, null, 2));
console.log(`Saved ${output.pathname}`);
