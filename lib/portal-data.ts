import "server-only";

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

export type TeacherLearner = {
  id: string;
  cohortId: string;
  name: string;
  alias: string;
  avatar: string;
  completed: number;
  points: number;
  status: "On track" | "Behind target" | "Needs review";
};

export type TeacherCohort = {
  id: string;
  name: string;
  course: string;
  targetLessonSlug: string | null;
  learners: TeacherLearner[];
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
      .select("id", { count: "exact", head: true }),
  ]);

  requireNoError(schoolsResult.error, "Schools query failed");
  requireNoError(cohortsResult.error, "Cohorts query failed");
  requireNoError(membershipsResult.error, "Membership query failed");
  requireNoError(enquiriesResult.error, "Enquiry query failed");

  const schools = (schoolsResult.data ?? []) as AdminSchoolSummary[];
  const schoolNames = new Map(schools.map((school) => [school.id, school.name]));
  const memberships = membershipsResult.data ?? [];

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
            .select("user_id, lesson_slug, completed, quiz_score")
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
    const learners = studentMemberships
      .filter((membership) => membership.cohort_id === cohort.id)
      .map((membership) => {
        const profile = profileMap.get(membership.user_id);
        const progress = (progressResult.data ?? []).filter(
          (row) => row.user_id === membership.user_id,
        );
        const completed = progress.filter((row) => row.completed).length;
        const points = progress.reduce(
          (sum, row) => sum + (row.quiz_score ?? 0),
          0,
        );
        const reachedTarget =
          !target ||
          progress.some(
            (row) => row.lesson_slug === target && row.completed,
          );

        return {
          id: membership.user_id,
          cohortId: cohort.id,
          name: profile?.display_name || "Learner",
          alias: profile?.leaderboard_alias || "Learner",
          avatar: profile?.avatar_key || "spark",
          completed,
          points,
          status: target
            ? reachedTarget
              ? ("On track" as const)
              : ("Behind target" as const)
            : ("Needs review" as const),
        };
      });

    return {
      id: cohort.id,
      name: cohort.name,
      course: cohort.course_slug,
      targetLessonSlug: target,
      learners,
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

export type StudentLeaderboardEntry = {
  name: string;
  alias: string;
  points: number;
};

export async function getStudentPortalData() {
  return {
    leaderboard: [] as StudentLeaderboardEntry[],
    progress: [
      { label: "Checkpoints complete", value: "Waiting for live data" },
      { label: "Current streak", value: "Waiting for live data" },
      { label: "Seat status", value: "Waiting for live data" },
    ] as PortalMetric[],
  };
}
