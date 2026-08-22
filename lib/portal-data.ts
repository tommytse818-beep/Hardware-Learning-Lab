export type PortalMetric = {
  label: string;
  value: string;
};

export type LearnerStatus = {
  name: string;
  alias: string;
  status: "On track" | "Behind target" | "Needs review";
  points: number;
};

export type CohortSummary = {
  id: string;
  name: string;
  seats: number;
  used: number;
  course: string;
};

export async function getAdminPortalData() {
  return {
    metrics: [
      { label: "Schools", value: "3" },
      { label: "Active cohorts", value: "6" },
      { label: "Student seats", value: "72/72" },
      { label: "Pending enrolments", value: "4" },
    ] as PortalMetric[],
    cohorts: [
      { id: "cohort-1", name: "Pilot cohort", seats: 12, used: 11, course: "OpenGuard Mini" },
      { id: "cohort-2", name: "STEM club", seats: 18, used: 18, course: "OpenGuard Mini" },
      { id: "cohort-3", name: "Design sprint", seats: 9, used: 7, course: "OpenGuard Mini" },
    ] as CohortSummary[],
  };
}

export async function getTeacherPortalData() {
  return {
    metrics: [
      { label: "Assigned learners", value: "18" },
      { label: "Behind target", value: "4" },
      { label: "Average points", value: "612" },
    ] as PortalMetric[],
    learners: [
      { name: "Ava", alias: "A", status: "On track", points: 1180 },
      { name: "Milo", alias: "M", status: "Behind target", points: 640 },
      { name: "Nina", alias: "N", status: "On track", points: 1040 },
      { name: "Otis", alias: "O", status: "Needs review", points: 420 },
    ] as LearnerStatus[],
  };
}

export async function getStudentPortalData() {
  return {
    leaderboard: [
      { name: "Ava", alias: "A", points: 1180 },
      { name: "Nina", alias: "N", points: 1040 },
      { name: "Omar", alias: "O", points: 980 },
    ],
    progress: [
      { label: "Checkpoints complete", value: "6/10" },
      { label: "Current streak", value: "4 lessons" },
      { label: "Seat status", value: "Active" },
    ],
  };
}
