import { drawerSenseLessons, type QuestionResponse } from "./drawersense-curriculum";
import { emptyLessonWork, hasWork, sanitizeProgress, type LessonWork, type PathwayProgress, type Point } from "./drawersense-progress";

type LessonDraft = {
  working?: { notes: string; strokes: Point[][]; ready: boolean };
  answers?: Record<string, QuestionResponse>;
  transfer?: QuestionResponse;
};

export type DrawerSenseDrafts = { version: 3; lessons: Record<string, LessonDraft> };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameWorking(left: Pick<LessonWork, "notes" | "strokes">, right: Pick<LessonWork, "notes" | "strokes">) {
  return left.notes === right.notes && same(left.strokes, right.strokes);
}

/** Store edits only. A confirmed copy of account work is never a browser draft. */
export function captureDrawerSenseDrafts(current: PathwayProgress, account: PathwayProgress): DrawerSenseDrafts {
  const drafts: DrawerSenseDrafts = { version: 3, lessons: {} };
  const safe = sanitizeProgress(current);
  for (const lesson of drawerSenseLessons) {
    const work = safe[lesson.id];
    if (!work) continue;
    const saved = account[lesson.id] ?? emptyLessonWork();
    const draft: LessonDraft = {};
    if (!sameWorking(work, saved)) {
      draft.working = { notes: work.notes, strokes: work.strokes, ready: hasWork(work) };
    }
    const answers = Object.fromEntries(Object.entries(work.answers).filter(([id, answer]) =>
      !saved.correct.includes(id) && !same(answer, saved.answers[id]),
    ));
    if (Object.keys(answers).length) draft.answers = answers;
    if (work.transfer !== undefined && saved.transfer === undefined) draft.transfer = work.transfer;
    if (draft.working || draft.answers || draft.transfer !== undefined) drafts.lessons[lesson.id] = draft;
  }
  return drafts;
}

/** Browser data supplies editable drafts only; account state owns every gate. */
export function mergeDrawerSenseDrafts(account: PathwayProgress, value: unknown): PathwayProgress {
  const merged = sanitizeProgress(account);
  if (!record(value) || value.version !== 3 || !record(value.lessons)) return merged;

  for (const lesson of drawerSenseLessons) {
    const raw = value.lessons[lesson.id];
    if (!record(raw)) continue;
    const saved = merged[lesson.id] ?? emptyLessonWork();
    const working = record(raw.working) && typeof raw.working.notes === "string" && Array.isArray(raw.working.strokes)
      ? raw.working : null;
    const clean = sanitizeProgress({ [lesson.id]: {
      answers: raw.answers, transfer: raw.transfer,
      notes: working?.notes, strokes: working?.strokes,
      saved: working?.ready === true,
    } })[lesson.id];
    const work = { ...saved, answers: { ...clean.answers, ...saved.answers }, transfer: saved.transfer ?? clean.transfer };
    if (working && !sameWorking(clean, saved)) {
      work.notes = clean.notes;
      work.strokes = clean.strokes;
      work.saved = hasWork(clean);
    }
    merged[lesson.id] = work;
  }
  return merged;
}

/** Keep edits made while a request was in flight; discard confirmed draft copies. */
export function reconcileDrawerSenseProgress(current: PathwayProgress, previousAccount: PathwayProgress, nextAccount: PathwayProgress) {
  return mergeDrawerSenseDrafts(nextAccount, captureDrawerSenseDrafts(current, previousAccount));
}
