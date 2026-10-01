import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCourse } from "./courses";
import { getPublishedCourseLessons } from "./course-outline";

const mocks = vi.hoisted(() => ({ createAdminClient: vi.fn(), getCourse: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/courses", () => ({ getCourse: mocks.getCourse }));

function clientFor(rows: Record<string, unknown[][]>) {
  const filters: Array<{ table: string; column: string; value: unknown }> = [];
  const from = vi.fn((table: string) => {
    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => { filters.push({ table, column, value }); return builder; },
      in: (column: string, value: unknown) => { filters.push({ table, column, value }); return builder; },
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: rows[table]?.shift() ?? [], error: null }).then(resolve),
    };
    return builder;
  });
  return { client: { from }, filters };
}

describe("teacher learner scope and review queue", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getCourse.mockImplementation(getCourse); });

  it("loads only the teacher's cohort learners and surfaces the final Week 2 review", async () => {
    const mock = clientFor({
      cohort_memberships: [[{ cohort_id: "class-1" }], [{ cohort_id: "class-1", user_id: "student-1" }]],
      cohorts: [[{ id: "class-1", name: "Class 1", course_slug: "open-guard-mini" }]],
      cohort_targets: [[]],
      profiles: [[{ id: "student-1", display_name: "Student", leaderboard_alias: "Student", avatar_key: "spark" }]],
      lesson_progress: [[
        { user_id: "student-1", course_slug: "open-guard-mini", lesson_slug: "drawer-2-1f", completed: false, quiz_score: 100, review_state: "awaiting_review", review_feedback: null },
        { user_id: "student-1", course_slug: "another-course", lesson_slug: "drawer-2-1f", completed: false, review_state: "awaiting_review" },
      ]],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { getTeacherPortalData } = await import("./portal-data");
    const result = await getTeacherPortalData("teacher-1");
    expect(mock.filters).toContainEqual({ table: "cohort_memberships", column: "user_id", value: "teacher-1" });
    expect(mock.filters).toContainEqual({ table: "cohort_memberships", column: "role", value: "teacher" });
    expect(mock.filters).toContainEqual({ table: "cohort_memberships", column: "cohort_id", value: ["class-1"] });
    expect(mock.filters).toContainEqual({ table: "lesson_progress", column: "user_id", value: ["student-1"] });
    expect(result.cohorts[0].learners[0].pendingReviews).toEqual([expect.objectContaining({ lessonSlug: "drawer-2-1f", lessonTitle: expect.stringContaining("2.1F"), courseSlug: "open-guard-mini" })]);
    expect(result.cohorts[0].totalPublished).toBe(18);
    expect(result.cohorts[0].publishedLessons).toHaveLength(18);
  });

  it.each([false, true])("counts known published checkpoints and checks all predecessors (complete=%s)", async (complete) => {
    const outline = getPublishedCourseLessons(getCourse("open-guard-mini"));
    const progress = outline.map((lesson) => ({ user_id: "student-1", course_slug: "open-guard-mini", lesson_slug: lesson.slug, completed: true, quiz_score: 100, review_state: "approved" }));
    if (!complete) {
      progress[0].review_state = "awaiting_review";
      progress[2].completed = false;
    }
    progress.push({ user_id: "student-1", course_slug: "open-guard-mini", lesson_slug: "unpublished", completed: true, quiz_score: 1000, review_state: "approved" });
    const mock = clientFor({
      cohort_memberships: [[{ cohort_id: "class-1" }], [{ cohort_id: "class-1", user_id: "student-1" }]],
      cohorts: [[{ id: "class-1", name: "Class 1", course_slug: "open-guard-mini" }]],
      cohort_targets: [[{ cohort_id: "class-1", target_lesson_slug: "drawer-2-1f" }]],
      profiles: [[]], lesson_progress: [progress],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { getTeacherPortalData } = await import("./portal-data");
    const learner = (await getTeacherPortalData("teacher-1")).cohorts[0].learners[0];
    expect(learner.completed).toBe(complete ? 18 : 16);
    expect(learner.status).toBe(complete ? "On track" : "Needs review");
    expect(learner.points).toBe(1800);
  });

  it("does not treat a later saved completion as reaching a target with missing predecessors", async () => {
    const mock = clientFor({
      cohort_memberships: [[{ cohort_id: "class-1" }], [{ cohort_id: "class-1", user_id: "student-1" }]],
      cohorts: [[{ id: "class-1", name: "Class 1", course_slug: "open-guard-mini" }]],
      cohort_targets: [[{ cohort_id: "class-1", target_lesson_slug: "drawer-2-1b" }]],
      profiles: [[]], lesson_progress: [[{ user_id: "student-1", course_slug: "open-guard-mini", lesson_slug: "drawer-2-1b", completed: true }]],
    });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { getTeacherPortalData } = await import("./portal-data");
    expect((await getTeacherPortalData("teacher-1")).cohorts[0].learners[0].status).toBe("Behind target");
  });

  it("does not request learner records for an unassigned teacher", async () => {
    const mock = clientFor({ cohort_memberships: [[]] });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { getTeacherPortalData } = await import("./portal-data");
    expect((await getTeacherPortalData("teacher-1")).cohorts).toEqual([]);
    expect(mock.client.from).toHaveBeenCalledTimes(1);
  });
});
