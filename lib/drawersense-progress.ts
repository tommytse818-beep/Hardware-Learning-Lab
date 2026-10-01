import { drawerSenseLessons, type Question, type QuestionResponse } from "./drawersense-curriculum";

export type Point = [number, number];
export type LessonWork = {
  answers: Record<string, QuestionResponse>;
  correct: string[];
  notes: string;
  strokes: Point[][];
  saved: boolean;
  reviewed: boolean;
  transfer?: QuestionResponse;
  complete: boolean;
  onlineReady?: boolean;
  override?: string;
  overrideReason?: string;
};
export type PathwayProgress = Record<string, LessonWork>;

export function emptyLessonWork(): LessonWork {
  return { answers: {}, correct: [], notes: "", strokes: [], saved: false, reviewed: false, complete: false };
}

const maxStrokes = 200;
const maxPointsPerStroke = 2000;
const maxNotesLength = 12000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFinitePoint(value: unknown): value is Point {
  return Array.isArray(value) && value.length === 2 &&
    typeof value[0] === "number" && Number.isFinite(value[0]) &&
    typeof value[1] === "number" && Number.isFinite(value[1]);
}

function sanitizeStrokes(value: unknown): Point[][] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxStrokes).flatMap((stroke: unknown) => {
    if (!Array.isArray(stroke)) return [];
    const points: Point[] = [];
    for (const point of stroke.slice(0, maxPointsPerStroke)) {
      if (!isFinitePoint(point)) continue;
      points.push([Math.max(0, Math.min(720, point[0])), Math.max(0, Math.min(320, point[1]))]);
    }
    return points.length ? [points] : [];
  });
}

function sanitizeAnswer(value: unknown, question: Question): QuestionResponse | undefined {
  if (question.kind === "choice") {
    return typeof value === "string" && question.choices?.some((_, index) => value === String(index))
      ? value
      : undefined;
  }
  if (!isRecord(value) || typeof value.value !== "string" || typeof value.unit !== "string") return undefined;
  if (!question.units?.some((unit) => unit.value === value.unit)) return undefined;
  // Keep unfinished number input as a draft. The server validates its syntax and
  // numerical answer; restoring local work must not count as a correct check.
  const answer: Exclude<QuestionResponse, string> = { value: value.value.slice(0, 40), unit: value.unit };
  if (typeof value.conclusion === "string" && question.conclusion?.choices.some((_, index) => value.conclusion === String(index))) {
    answer.conclusion = value.conclusion;
  }
  return answer;
}

/** Restore only known lesson fields. Local flags are display state, not authority. */
export function sanitizeProgress(value: unknown): PathwayProgress {
  const progress: PathwayProgress = {};
  if (!isRecord(value)) return progress;

  for (const lesson of drawerSenseLessons) {
    if (!Object.hasOwn(value, lesson.id)) continue;
    const raw = value[lesson.id];
    if (!isRecord(raw)) continue;

    const work = emptyLessonWork();
    const answers = isRecord(raw.answers) ? raw.answers : {};
    for (const question of lesson.questions) {
      if (!Object.hasOwn(answers, question.id)) continue;
      const answer = sanitizeAnswer(answers[question.id], question);
      if (answer !== undefined) work.answers[question.id] = answer;
    }
    const transfer = sanitizeAnswer(raw.transfer, lesson.transfer);
    if (transfer !== undefined) work.transfer = transfer;
    work.correct = lesson.questions
      .filter((question) => Array.isArray(raw.correct) && raw.correct.includes(question.id))
      .map((question) => question.id);
    work.notes = typeof raw.notes === "string" ? raw.notes.slice(0, maxNotesLength) : "";
    work.strokes = sanitizeStrokes(raw.strokes);
    work.saved = raw.saved === true;
    work.reviewed = raw.reviewed === true;
    work.complete = raw.complete === true;
    work.onlineReady = raw.onlineReady === true;
    if (typeof raw.override === "string" && raw.override.length > 0 && raw.override.length <= 4000) {
      work.override = raw.override;
    }
    if (typeof raw.overrideReason === "string") work.overrideReason = raw.overrideReason.slice(0, 1000);
    progress[lesson.id] = work;
  }
  return progress;
}

// Work is evidence for human review, never an automatic drawing grade.
export function hasWork(work: unknown): work is LessonWork {
  if (!isRecord(work) || work.saved !== true || typeof work.notes !== "string" || work.notes.length > maxNotesLength) return false;
  if (!Array.isArray(work.strokes) || work.strokes.length > maxStrokes) return false;
  let hasSketch = false;
  for (const stroke of work.strokes) {
    if (!Array.isArray(stroke) || stroke.length > maxPointsPerStroke) return false;
    for (const point of stroke) {
      if (!isFinitePoint(point) || point[0] < 0 || point[0] > 720 || point[1] < 0 || point[1] > 320) return false;
    }
    if (stroke.length >= 5) hasSketch = true;
  }
  return work.notes.trim().length >= 20 || hasSketch;
}
