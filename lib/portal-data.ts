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

export type StudentLeaderboardEntry = {
  name: string;
  alias: string;
  points: number;
};

export async function getAdminPortalData() {
  return {
    metrics: [
      { label: "Schools", value: "Waiting for live data" },
      { label: "Active cohorts", value: "Waiting for live data" },
      { label: "Student seats", value: "Waiting for live data" },
      { label: "Pending enrolments", value: "Waiting for live data" },
    ] as PortalMetric[],
    cohorts: [] as CohortSummary[],
  };
}

export async function getTeacherPortalData() {
  return {
    metrics: [
      { label: "Assigned learners", value: "Waiting for live data" },
      { label: "Behind target", value: "Waiting for live data" },
      { label: "Average points", value: "Waiting for live data" },
    ] as PortalMetric[],
    learners: [] as LearnerStatus[],
  };
}

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
