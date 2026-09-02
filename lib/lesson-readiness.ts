import type { Course, Lesson } from "@/lib/courses";

export type CorrectQuizAttempt = {
  question_id: string;
  points_awarded: number;
};

export type LessonReviewState =
  | "not_started"
  | "online_ready"
  | "awaiting_review"
  | "approved"
  | "revision_requested";

export type LessonAvailability = {
  lessonSlug: string;
  available: boolean;
  completed: boolean;
  blockedBy?: string;
};

export function getRequiredQuestionIds(lesson: Lesson) {
  const questions = lesson.microChecks?.length ? lesson.microChecks : [lesson.quiz];
  return questions.map((question) => question.id);
}

export function summarizeLessonQuizProgress(
  requiredQuestionIds: string[],
  correctAttempts: CorrectQuizAttempt[],
  humanReviewRequired = false,
) {
  const firstCorrectPoints = new Map<string, number>();

  for (const attempt of correctAttempts) {
    if (
      requiredQuestionIds.includes(attempt.question_id) &&
      !firstCorrectPoints.has(attempt.question_id)
    ) {
      firstCorrectPoints.set(attempt.question_id, attempt.points_awarded);
    }
  }

  const solvedQuestionIds = requiredQuestionIds.filter((questionId) =>
    firstCorrectPoints.has(questionId),
  );
  const onlineReady =
    requiredQuestionIds.length > 0 &&
    solvedQuestionIds.length === requiredQuestionIds.length;
  const quizScore = onlineReady
    ? Math.round(
        requiredQuestionIds.reduce(
          (sum, questionId) => sum + (firstCorrectPoints.get(questionId) ?? 0),
          0,
        ) / requiredQuestionIds.length,
      )
    : 0;

  return {
    solvedQuestionIds,
    onlineReady,
    completed: onlineReady && !humanReviewRequired,
    quizScore,
    reviewState: onlineReady
      ? humanReviewRequired
        ? ("awaiting_review" as const)
        : ("online_ready" as const)
      : ("not_started" as const),
  };
}

export function getRecommendedLessonSlug(
  course: Course,
  completedLessonSlugs: Set<string>,
) {
  return (
    course.lessons.find((lesson, index) => {
      if (completedLessonSlugs.has(lesson.slug)) return false;
      if (index === 0) return true;
      return completedLessonSlugs.has(course.lessons[index - 1].slug);
    })?.slug ?? course.lessons[0]?.slug ?? null
  );
}

export function getLessonAvailability(
  course: Course,
  completedLessonSlugs: Set<string>,
  canPreviewAll: boolean,
): LessonAvailability[] {
  return course.lessons.map((lesson, index) => {
    const completed = completedLessonSlugs.has(lesson.slug);
    const available =
      canPreviewAll || index === 0 || completed || completedLessonSlugs.has(course.lessons[index - 1].slug);

    return {
      lessonSlug: lesson.slug,
      available,
      completed,
      blockedBy: available ? undefined : course.lessons[index - 1].slug,
    };
  });
}
