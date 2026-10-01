import { createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getViewer: vi.fn(), getCourseAccess: vi.fn(), getCourseProgress: vi.fn(), getCourse: vi.fn(), getLesson: vi.fn(), quiz: vi.fn(({ questionId }: { questionId: string }) => createElement("div", null, `CHECKPOINT:${questionId}`)), microChecks: vi.fn(() => null), formative: vi.fn(() => null), video: vi.fn(() => null) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/lesson-quiz", () => ({ LessonQuiz: mocks.quiz, LessonMicroCheckGroup: mocks.microChecks }));
vi.mock("@/components/lesson-formative-check", () => ({ LessonFormativeCheck: mocks.formative }));
vi.mock("@/components/lesson-video", () => ({ LessonVideo: mocks.video }));
vi.mock("@/components/verified-tutor", () => ({ VerifiedTutor: () => null }));
vi.mock("@/components/course/week-one-foundation-diagram", () => import("../../../../../components/course/week-one-foundation-diagram"));
vi.mock("@/lib/course-resources", () => ({ hasActiveCourseResource: () => false }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/progress", () => ({ getCourseProgress: mocks.getCourseProgress }));
vi.mock("@/lib/formative-checks", () => ({ getFormativeCheckView: (id: string) => ({ id, kind: "choice", prompt: "Practice", options: ["A", "B"] }) }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse, getLesson: mocks.getLesson, getAdjacentLessons: () => ({ previous: null, next: { slug: "next-lesson", section: "1.2" } }) }));
vi.mock("@/lib/lesson-readiness", () => import("../../../../../lib/lesson-readiness"));

const choice = { kind: "choice", id: "choice-1", question: "Which path?", options: ["Left", "Right"], correctIndex: 1, hint: "Trace the route.", method: ["SECRET_WORKED_METHOD"], explanation: "SECRET_EXPLANATION" };
const numeric = { kind: "numeric", id: "numeric-1", question: "What resistance?", answer: 470, tolerance: 1, unit: "Ω", placeholder: "Enter a value", hint: "Apply the relationship.", method: ["NUMERIC_WORKED_METHOD"], explanation: "NUMERIC_EXPLANATION" };
const lesson = { slug: "first-lesson", section: "1.1", title: "First lesson", summary: "Lesson introduction", duration: "5 min", delivery: "Pre-recorded", objectives: [], sections: [], practicalTask: "Record your reasoning.", video: {}, tutor: {}, quiz: choice };
const course = { slug: "open-guard-mini", shortTitle: "DrawerSense", lessons: [lesson, { ...lesson, slug: "next-lesson", section: "1.2" }] };
const viewer = { id: "account-1", role: "student", verified: true, demo: false, mustChangePassword: false };
const props = { params: Promise.resolve({ courseSlug: course.slug, lessonSlug: lesson.slug }) };

function componentProps(node: unknown, component: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) return node.map((item) => componentProps(item, component)).find(Boolean) ?? null;
  if (!isValidElement<Record<string, unknown>>(node)) return null;
  return node.type === component ? node.props : componentProps(node.props.children, component);
}
async function page() { return (await import("./page")).default(props); }

describe("legacy lesson staff teaching access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getViewer.mockResolvedValue(viewer);
    mocks.getCourseAccess.mockResolvedValue({ allowed: true });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: true, records: [] });
    mocks.getCourse.mockReturnValue(course);
    mocks.getLesson.mockReturnValue(lesson);
  });

  it.each(["teacher", "admin"])("shows worked choice answers and next navigation to verified %s without completion", async (role) => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role });
    const output = await page();
    const html = renderToStaticMarkup(output);
    expect(html).toContain("Teaching view.");
    expect(html).toContain("does not mark a learner checkpoint complete");
    expect(html).toContain("Right<strong");
    expect(html).toContain("SECRET_WORKED_METHOD");
    expect(html).toContain("SECRET_EXPLANATION");
    expect(html).toContain("Continue to 1.2");
    expect(componentProps(output, mocks.quiz)).toBeNull();
    expect(html).not.toContain("Answer the checkpoint correctly");
  });

  it("shows numeric answers with units and tolerance in the teaching guide", async () => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role: "teacher" });
    mocks.getLesson.mockReturnValue({ ...lesson, quiz: numeric });
    const html = renderToStaticMarkup(await page());
    expect(html).toContain("470 Ω");
    expect(html).toContain("±1 Ω");
    expect(html).toContain("NUMERIC_WORKED_METHOD");
  });

  it("shows every micro-check method for staff even while progress is unavailable", async () => {
    mocks.getViewer.mockResolvedValue({ ...viewer, role: "admin" });
    mocks.getLesson.mockReturnValue({ ...lesson, microChecks: [choice, { ...choice, id: "choice-2", method: ["SECOND_METHOD"] }] });
    mocks.getCourseProgress.mockResolvedValue({ databaseReady: false, records: [] });
    const output = await page();
    const html = renderToStaticMarkup(output);
    expect(html).toContain("SECRET_WORKED_METHOD");
    expect(html).toContain("SECOND_METHOD");
    expect(html).toContain("Continue to 1.2");
    expect(componentProps(output, mocks.microChecks)).toBeNull();
  });

  it("withholds worked answers and next navigation for an unsolved student checkpoint", async () => {
    const output = await page();
    const html = renderToStaticMarkup(output);
    expect(componentProps(output, mocks.quiz)).toMatchObject({ initialCompleted: false, initialMethod: undefined, initialExplanation: undefined });
    expect(JSON.stringify(componentProps(output, mocks.quiz))).not.toContain("correctIndex");
    expect(html).not.toContain("SECRET_WORKED_METHOD");
    expect(html).not.toContain("Continue to 1.2");
    expect(html).toContain("Answer the checkpoint correctly");
  });

  it("withholds unsolved micro-check methods from student component props", async () => {
    mocks.getLesson.mockReturnValue({ ...lesson, microChecks: [choice] });
    const output = await page();
    const checks = componentProps(output, mocks.microChecks)?.checks;
    expect(checks).toEqual([expect.objectContaining({ method: [], explanation: "" })]);
    expect(JSON.stringify(checks)).not.toContain("correctIndex");
    expect(renderToStaticMarkup(output)).not.toContain("SECRET_EXPLANATION");
  });

  it.each([{ ...viewer, role: "teacher", verified: false }, { ...viewer, role: "admin", demo: true }, { ...viewer, role: "admin", id: null }])("rejects unverified or demo staff before exposing teaching answers", async (identity) => {
    mocks.getViewer.mockResolvedValue(identity);
    await expect(page()).rejects.toThrow("REDIRECT:/login");
    expect(mocks.getCourseProgress).not.toHaveBeenCalled();
  });

  it.each(["0", "1.1", "1.2", "1.4", "1.7", "1.8", "1.9"])("retires misleading artwork from both diagram and video in section %s", async (section) => {
    mocks.getLesson.mockReturnValue({ ...lesson, section, video: { posterSrc: "/retired.webp" }, diagram: { src: "/retired.webp", alt: "Retired drawing", width: 800, height: 450, caption: "Retired." } });
    const output = await page();
    expect(componentProps(output, mocks.video)?.video).toMatchObject({ posterSrc: undefined });
    expect(renderToStaticMarkup(output)).not.toContain("retired.webp");
  });

  it("explains that the retained pull-up diagram uses separate practice values", async () => {
    mocks.getLesson.mockReturnValue({ ...lesson, section: "1.6", video: { posterSrc: "/pull-practice.webp" } });
    const output = await page();
    expect(componentProps(output, mocks.video)?.video).toMatchObject({ posterSrc: "/pull-practice.webp" });
    expect(renderToStaticMarkup(output)).toContain("5 V / 100 kΩ image is a standalone pull-up practice example");
  });

  it("shows prerequisite diagrams before a student has answered the checkpoint", async () => {
    mocks.getLesson.mockReturnValue({ ...lesson, sections: [{ heading: "Parallel: the same two endpoint nodes", paragraphs: ["Trace the two nodes."] }] });
    const html = renderToStaticMarkup(await page());
    expect(html).toContain("Identify both endpoints of each branch");
    expect(html).toContain("R1 and R2 each connect between top node A and bottom node B");
    expect(html).not.toContain("SECRET_WORKED_METHOD");
  });

  it("places the 1.4 LED attempt and existing checkpoint before capacitor teaching", async () => {
    mocks.getLesson.mockReturnValue({
      ...lesson,
      section: "1.4",
      sections: [
        { stepId: "1-4-led-attempt", heading: "LED attempt", paragraphs: ["LED_TEACHING"] },
        { stepId: "1-4-capacitor-charge", heading: "Capacitor charge", paragraphs: ["CAPACITOR_TEACHING"] },
      ],
      checkpointAfterStepId: "1-4-led-attempt",
      checkpointTask: "STUDENT_LED_ATTEMPT",
      quiz: numeric,
    });
    const html = renderToStaticMarkup(await page());
    expect(html.indexOf("LED_TEACHING")).toBeLessThan(html.indexOf("STUDENT_LED_ATTEMPT"));
    expect(html.indexOf("STUDENT_LED_ATTEMPT")).toBeLessThan(html.indexOf("CHECKPOINT:numeric-1"));
    expect(html.indexOf("CHECKPOINT:numeric-1")).toBeLessThan(html.indexOf("CAPACITOR_TEACHING"));
  });

  it("places the 1.6 pull-input checkpoint before RC teaching", async () => {
    mocks.getLesson.mockReturnValue({
      ...lesson,
      section: "1.6",
      sections: [
        { stepId: "1-6-input-attempt", heading: "Input attempt", paragraphs: ["INPUT_TEACHING"] },
        { stepId: "1-6-rc-charge", heading: "RC teaching", paragraphs: ["RC_TEACHING"] },
      ],
      checkpointAfterStepId: "1-6-input-attempt",
      checkpointTask: "STUDENT_INPUT_ATTEMPT",
    });
    const html = renderToStaticMarkup(await page());
    expect(html.indexOf("INPUT_TEACHING")).toBeLessThan(html.indexOf("STUDENT_INPUT_ATTEMPT"));
    expect(html.indexOf("STUDENT_INPUT_ATTEMPT")).toBeLessThan(html.indexOf("CHECKPOINT:choice-1"));
    expect(html.indexOf("CHECKPOINT:choice-1")).toBeLessThan(html.indexOf("RC_TEACHING"));
  });
});
