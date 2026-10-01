import { isValidElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), fetch: vi.fn(), formData: vi.fn() }));
vi.mock("react", async (importOriginal) => ({ ...await importOriginal<typeof import("react")>(), useState: (value: unknown) => [value, vi.fn()] }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/components/avatar-badge", () => ({ AvatarBadge: () => null }));

function forms(node: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(node)) return node.flatMap(forms);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [...(node.type === "form" ? [node.props] : []), ...forms(node.props.children)];
}

describe("teacher checkpoint decisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubGlobal("FormData", class {
      private decision: string;
      constructor(form: unknown, submitter: { value: string }) {
        mocks.formData(form, submitter);
        this.decision = submitter?.value;
      }
      get(key: string) { return key === "decision" ? this.decision : "Evidence inspected."; }
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(["approved", "revision_requested"])("sends the clicked %s decision and refreshes saved progress", async (decision) => {
    const { TeacherDashboard } = await import("./teacher-dashboard");
    const page = TeacherDashboard({ metrics: [], cohorts: [{
      id: "cohort-1", name: "Class", course: "open-guard-mini", targetLessonSlug: null,
      publishedLessons: [{ slug: "drawer-2-1f", section: "2.1F", title: "Final checkpoint", humanReviewRequired: true }], totalPublished: 18,
      learners: [{ id: "student-1", cohortId: "cohort-1", name: "Learner", alias: "Learner", avatar: "spark", completed: 0, points: 0, status: "Needs review", pendingReviews: [{ courseSlug: "open-guard-mini", lessonSlug: "induction-readiness", lessonTitle: "Induction", reviewState: "awaiting_review", feedback: null }] }],
    }] });
    const review = forms(page)[1];
    const form = {};
    const submitter = { value: decision };
    (review.onSubmit as (event: unknown) => void)({ preventDefault: vi.fn(), currentTarget: form, nativeEvent: { submitter } });
    await vi.waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
    expect(mocks.formData).toHaveBeenCalledWith(form, submitter);
    expect(mocks.fetch).toHaveBeenCalledWith("/api/teacher/lesson-review", expect.objectContaining({ body: JSON.stringify({ studentId: "student-1", courseSlug: "open-guard-mini", lessonSlug: "induction-readiness", decision, feedback: "Evidence inspected." }) }));
  });
});
