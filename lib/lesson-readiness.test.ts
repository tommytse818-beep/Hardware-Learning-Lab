import { describe, expect, it } from "vitest";

import type { Course } from "@/lib/courses";
import {
  getRecommendedLessonSlug,
  getLessonAvailability,
  summarizeLessonQuizProgress,
} from "./lesson-readiness";

const course = {
  lessons: [
    { slug: "one" },
    { slug: "two" },
    { slug: "three" },
  ],
} as Course;

describe("summarizeLessonQuizProgress", () => {
  it("keeps a multi-question lesson incomplete after one correct answer", () => {
    expect(
      summarizeLessonQuizProgress(
        ["q1", "q2", "q3"],
        [{ question_id: "q1", points_awarded: 100 }],
      ),
    ).toMatchObject({
      solvedQuestionIds: ["q1"],
      onlineReady: false,
      completed: false,
      quizScore: 0,
    });
  });

  it("completes when every required question has a correct attempt and averages locked points", () => {
    expect(
      summarizeLessonQuizProgress(
        ["q1", "q2", "q3"],
        [
          { question_id: "q1", points_awarded: 100 },
          { question_id: "q2", points_awarded: 50 },
          { question_id: "q3", points_awarded: 25 },
        ],
      ),
    ).toMatchObject({
      solvedQuestionIds: ["q1", "q2", "q3"],
      onlineReady: true,
      completed: true,
      quizScore: 58,
    });
  });

  it("continues to complete a single-question lesson after one correct answer", () => {
    expect(
      summarizeLessonQuizProgress(
        ["single"],
        [{ question_id: "single", points_awarded: 50 }],
      ),
    ).toMatchObject({
      solvedQuestionIds: ["single"],
      onlineReady: true,
      completed: true,
      quizScore: 50,
    });
  });

  it("requires human review after online preparation", () => {
    expect(
      summarizeLessonQuizProgress(
        ["review"],
        [{ question_id: "review", points_awarded: 100 }],
        true,
      ),
    ).toMatchObject({
      onlineReady: true,
      completed: false,
      quizScore: 100,
      reviewState: "awaiting_review",
    });
  });
});

describe("lesson availability", () => {
  it("lets students open the first available lesson and completed review lessons only", () => {
    expect(getLessonAvailability(course, new Set(["one"]), false)).toEqual([
      { lessonSlug: "one", available: true, completed: true },
      { lessonSlug: "two", available: true, completed: false },
      { lessonSlug: "three", available: false, completed: false, blockedBy: "two" },
    ]);
  });

  it("lets reviewers preview every lesson", () => {
    expect(getLessonAvailability(course, new Set(), true).every((item) => item.available)).toBe(true);
  });

  it("returns the first lesson that a student can open", () => {
    expect(getRecommendedLessonSlug(course, new Set(["one"]))).toBe("two");
  });
});
