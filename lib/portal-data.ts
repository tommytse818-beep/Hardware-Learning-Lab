import "server-only";

import { getCourse } from "@/lib/courses";
import { getPublishedCourseLessons, type PublishedCourseLesson } from "./course-outline";
import { createAdminClient } from "@/lib/supabase/admin";

export type PortalMetric = {
  label: string;
  value: string;
};

export type AdminCohortSummary = {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  seats: number;
  used: number;
  course: string;
  active: boolean;
};

export type AdminSchoolSummary = {
  id: string;
  name: string;
  status: string;
};

export type AdminEnquirySummary = {
  id: string;
  schoolName: string;
  contactName: string;
  email: string;
  message: string;
  notificationStatus: "pending" | "sent" | "failed";
  createdAt: string;
};

export type TeacherLearner = {
  id: string;
  cohortId: string;
  name: string;
  alias: string;
  avatar: string;
  completed: number;
  points: number;
  status: "On track" | "Behind target" | "Needs review";
  pendingReviews: TeacherPendingReview[];
};

export type TeacherPendingReview = {
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  reviewState: string;
  feedback: string | null;
};

export type TeacherCohort = {
  id: string;
  name: string;
  course: string;
  targetLessonSlug: string | null;
  learners: TeacherLearner[];
  publishedLessons: PublishedCourseLesson[];
  totalPublished: number;
};

function requireNoError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export async function getAdminPortalData() {
  const admin = createAdminClient();

  const [
    schoolsResult,
    cohortsResult,
    membershipsResult,
    enquiriesResult,
  ] = await Promise.all([
    admin.from("schools").select("id, name, status").order("created_at"),
    admin
      .from("cohorts")
      .select("id, school_id, name, course_slug, student_seat_limit, active")
      .order("created_at"),
    admin
      .from("cohort_memberships")
      .select("cohort_id, role"),
    admin
      .from("school_enquiries")
      .select(
        "id, school_name, contact_name, email, message, notification_status, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  requireNoError(schoolsResult.error, "Schools query failed");
  requireNoError(cohortsResult.error, "Cohorts query failed");
  requireNoError(membershipsResult.error, "Membership query failed");
  requireNoError(enquiriesResult.error, "Enquiry query failed");

  const schools = (schoolsResult.data ?? []) as AdminSchoolSummary[];
  const schoolNames = new Map(schools.map((school) => [school.id, school.name]));
  const memberships = membershipsResult.data ?? [];
  const enquiries: AdminEnquirySummary[] = (enquiriesResult.data ?? []).map(
    (enquiry) => ({
      id: String(enquiry.id),
      schoolName: enquiry.school_name,
      contactName: enquiry.contact_name,
      email: enquiry.email,
      message: enquiry.message,
      notificationStatus: enquiry.notification_status,
      createdAt: enquiry.created_at,
    }),
  );

  const cohorts: AdminCohortSummary[] = (cohortsResult.data ?? []).map(
    (cohort) => ({
      id: cohort.id,
      name: cohort.name,
      schoolId: cohort.school_id,
      schoolName: schoolNames.get(cohort.school_id) ?? "Unknown school",
      seats: cohort.student_seat_limit,
      used: memberships.filter(
        (membership) =>
          membership.cohort_id === cohort.id && membership.role === "student",
      ).length,
      course: cohort.course_slug,
      active: cohort.active,
    }),
  );

  const totalSeats = cohorts.reduce((sum, cohort) => sum + cohort.seats, 0);
  const usedSeats = cohorts.reduce((sum, cohort) => sum + cohort.used, 0);

  return {
    metrics: [
      { label: "Schools", value: String(schools.length) },
      {
        label: "Active cohorts",
        value: String(cohorts.filter((cohort) => cohort.active).length),
      },
      { label: "Student seats", value: `${usedSeats}/${totalSeats}` },
      {
        label: "School enquiries",
        value: String(enquiriesResult.count ?? 0),
      },
    ] satisfies PortalMetric[],
    schools,
    cohorts,
    enquiries,
  };
}

export async function getTeacherPortalData(teacherId: string) {
  const admin = createAdminClient();

  const { data: teacherMemberships, error: teacherError } = await admin
    .from("cohort_memberships")
    .select("cohort_id")
    .eq("user_id", teacherId)
    .eq("role", "teacher");

  requireNoError(teacherError, "Teacher assignments query failed");

  const cohortIds = teacherMemberships?.map((row) => row.cohort_id) ?? [];

  if (cohortIds.length === 0) {
    return {
      metrics: [
        { label: "Assigned cohorts", value: "0" },
        { label: "Learners in scope", value: "0" },
        { label: "Behind target", value: "0" },
      ] satisfies PortalMetric[],
      cohorts: [] as TeacherCohort[],
    };
  }

  const [
    cohortsResult,
    studentMembershipsResult,
    targetsResult,
  ] = await Promise.all([
    admin
      .from("cohorts")
      .select("id, name, course_slug")
      .in("id", cohortIds)
      .eq("active", true),
    admin
      .from("cohort_memberships")
      .select("cohort_id, user_id")
      .in("cohort_id", cohortIds)
      .eq("role", "student"),
    admin
      .from("cohort_targets")
      .select("cohort_id, target_lesson_slug")
      .in("cohort_id", cohortIds),
  ]);

  requireNoError(cohortsResult.error, "Assigned cohorts query failed");
  requireNoError(
    studentMembershipsResult.error,
    "Student memberships query failed",
  );
  requireNoError(targetsResult.error, "Cohort target query failed");

  const studentMemberships = studentMembershipsResult.data ?? [];
  const studentIds = [
    ...new Set(studentMemberships.map((row) => row.user_id)),
  ];

  const [profilesResult, progressResult] =
    studentIds.length > 0
      ? await Promise.all([
          admin
            .from("profiles")
            .select("id, display_name, leaderboard_alias, avatar_key")
            .in("id", studentIds),
          admin
            .from("lesson_progress")
            .select("user_id, course_slug, lesson_slug, completed, quiz_score, review_state, review_feedback")
            .in("user_id", studentIds),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];

  requireNoError(profilesResult.error, "Student profiles query failed");
  requireNoError(progressResult.error, "Student progress query failed");

  const profileMap = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );
  const targets = new Map(
    (targetsResult.data ?? []).map((target) => [
      target.cohort_id,
      target.target_lesson_slug,
    ]),
  );

  const cohorts: TeacherCohort[] = (cohortsResult.data ?? []).map((cohort) => {
    const target = targets.get(cohort.id) ?? null;
    const publishedLessons = getPublishedCourseLessons(getCourse(cohort.course_slug));
    const publishedBySlug = new Map(publishedLessons.map((lesson) => [lesson.slug, lesson]));
    const learners = studentMemberships
      .filter((membership) => membership.cohort_id === cohort.id)
      .map((membership) => {
        const profile = profileMap.get(membership.user_id);
        const progress = (progressResult.data ?? []).filter(
          (row) =>
            row.user_id === membership.user_id &&
            row.course_slug === cohort.course_slug && publishedBySlug.has(row.lesson_slug),
        );
        const humanReviewLessons = new Map<string, { title: string }>(
          publishedLessons
            .filter((lesson) => lesson.humanReviewRequired)
            .map((lesson) => [lesson.slug, { title: `${lesson.section} · ${lesson.title}` }]),
        );
        const pendingReviews = progress
          .filter(
            (row) =>
              humanReviewLessons.has(row.lesson_slug) &&
              ["awaiting_review", "revision_requested"].includes(
                row.review_state ?? "not_started",
              ),
          )
          .map((row) => ({
            courseSlug: cohort.course_slug,
            lessonSlug: row.lesson_slug,
            lessonTitle:
              humanReviewLessons.get(row.lesson_slug)?.title ?? row.lesson_slug,
            reviewState: row.review_state ?? "not_started",
            feedback: row.review_feedback ?? null,
          }));
        const completedSlugs = new Set(progress.filter((row) => row.completed === true && (
          !publishedBySlug.get(row.lesson_slug)?.humanReviewRequired || row.review_state === "approved"
        )).map((row) => row.lesson_slug));
        const completed = completedSlugs.size;
        const points = progress.reduce(
          (sum, row) => sum + (row.quiz_score ?? 0),
          0,
        );
        const targetIndex = publishedLessons.findIndex((lesson) => lesson.slug === target);
        const reachedTarget = !target || (targetIndex >= 0 && publishedLessons.slice(0, targetIndex + 1).every((lesson) => completedSlugs.has(lesson.slug)));

        return {
          id: membership.user_id,
          cohortId: cohort.id,
          name: profile?.display_name || "Learner",
          alias: profile?.leaderboard_alias || "Learner",
          avatar: profile?.avatar_key || "spark",
          completed,
          points,
          status: target
            ? pendingReviews.some((review) => review.reviewState === "awaiting_review")
              ? ("Needs review" as const)
              : reachedTarget
              ? ("On track" as const)
              : ("Behind target" as const)
            : ("Needs review" as const),
          pendingReviews,
        };
      });

    return {
      id: cohort.id,
      name: cohort.name,
      course: cohort.course_slug,
      targetLessonSlug: target,
      learners,
      publishedLessons,
      totalPublished: publishedLessons.length,
    };
  });

  const learners = cohorts.flatMap((cohort) => cohort.learners);

  return {
    metrics: [
      { label: "Assigned cohorts", value: String(cohorts.length) },
      { label: "Learners in scope", value: String(learners.length) },
      {
        label: "Behind target",
        value: String(
          learners.filter((learner) => learner.status === "Behind target")
            .length,
        ),
      },
    ] satisfies PortalMetric[],
    cohorts,
  };
}
