export const DEMO_PROGRESS_COOKIE = "hardware-learning-demo-progress";

export type DemoProgressEntry = {
  courseSlug: string;
  lessonSlug: string;
  completed: boolean;
  quizScore: number;
  updatedAt: string;
};

const MAX_DEMO_RECORDS = 30;

function isValidEntry(value: unknown): value is DemoProgressEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<DemoProgressEntry>;

  return (
    typeof entry.courseSlug === "string" &&
    entry.courseSlug.length > 0 &&
    typeof entry.lessonSlug === "string" &&
    entry.lessonSlug.length > 0 &&
    typeof entry.completed === "boolean" &&
    typeof entry.quizScore === "number" &&
    Number.isFinite(entry.quizScore) &&
    entry.quizScore >= 0 &&
    entry.quizScore <= 100 &&
    typeof entry.updatedAt === "string"
  );
}

export function decodeDemoProgress(value?: string): DemoProgressEntry[] {
  if (!value) {
    return [];
  }

  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidEntry).slice(-MAX_DEMO_RECORDS);
  } catch {
    return [];
  }
}

export function encodeDemoProgress(entries: DemoProgressEntry[]) {
  return Buffer.from(
    JSON.stringify(entries.slice(-MAX_DEMO_RECORDS)),
    "utf8",
  ).toString("base64url");
}

export function mergeDemoProgress(
  entries: DemoProgressEntry[],
  update: Omit<DemoProgressEntry, "updatedAt">,
) {
  const key = `${update.courseSlug}:${update.lessonSlug}`;
  const existing = entries.find(
    (entry) => `${entry.courseSlug}:${entry.lessonSlug}` === key,
  );
  const withoutCurrent = entries.filter(
    (entry) => `${entry.courseSlug}:${entry.lessonSlug}` !== key,
  );

  return [
    ...withoutCurrent,
    {
      ...update,
      completed: Boolean(existing?.completed) || update.completed,
      quizScore: Math.max(existing?.quizScore ?? 0, update.quizScore),
      updatedAt: new Date().toISOString(),
    },
  ].slice(-MAX_DEMO_RECORDS);
}
