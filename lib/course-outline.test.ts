import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { getCourse } from "./courses";
import { getPublishedCourseLessons } from "./course-outline";

describe("published course outline", () => {
  it("lists all 18 published DrawerSense checkpoints and only safe labels", () => {
    const outline = getPublishedCourseLessons(getCourse("open-guard-mini"));
    expect(outline).toHaveLength(18);
    expect(new Set(outline.map((lesson) => lesson.slug)).size).toBe(18);
    expect(outline.slice(-8).map((lesson) => lesson.slug)).toEqual([
      "drawer-2-0a", "drawer-2-0b", "drawer-2-1a", "drawer-2-1b",
      "drawer-2-1c", "drawer-2-1d", "drawer-2-1e", "drawer-2-1f",
    ]);
    expect(outline.at(-1)?.humanReviewRequired).toBe(true);
    expect(Object.keys(outline[0]).sort()).toEqual(["humanReviewRequired", "section", "slug", "title"]);
  });

  it("does not append DrawerSense to another or unknown course", () => {
    const course = getCourse("open-guard-mini")!;
    expect(getPublishedCourseLessons({ ...course, slug: "another-course" })).toHaveLength(course.lessons.length);
    expect(getPublishedCourseLessons(undefined)).toEqual([]);
  });
});
