import { NextResponse } from "next/server";
import { getDrawerSenseAccess } from "@/lib/drawersense-access";
import { drawerSenseLessons, getDrawerSenseLesson } from "@/lib/drawersense-curriculum";
import { gradeQuestion, getWorkedSolution } from "@/lib/drawersense-answer-key";
import { hasWork, sanitizeProgress } from "@/lib/drawersense-progress";
import {
  DRAWERSENSE_REVIEW_STEP,
  DRAWERSENSE_WORK_STEP,
  getDrawerSenseServerProgress,
  recordDrawerSenseStep,
} from "@/lib/drawersense-server-progress";

export const runtime = "nodejs";

function response(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const access = await getDrawerSenseAccess();
  if (!access.allowed) return response({ error: "Sign in with course access to use these activities." }, 403);
  const state = await getDrawerSenseServerProgress(access.storageScope);
  if (!state.databaseReady) return response({ error: "Account progress is unavailable. Try again shortly." }, 503);
  return response(state);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return response({ error: "This request must come from the project page." }, 403);
  const access = await getDrawerSenseAccess();
  if (!access.allowed) return response({ error: "Sign in with course access to use these activities." }, 403);

  let body;
  try {
    const text = await request.text();
    if (text.length > 750_000) return response({ error: "Your working is too large. Shorten it and try again." }, 413);
    body = JSON.parse(text);
  } catch { return response({ error: "Invalid activity request." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return response({ error: "Invalid activity request." }, 400);
  const lesson = getDrawerSenseLesson(body.lessonId);
  if (!lesson) return response({ error: "Unknown activity." }, 404);
  if (!["check", "solution", "review", "transfer"].includes(body.action)) return response({ error: "Unknown activity action." }, 400);

  const state = await getDrawerSenseServerProgress(access.storageScope);
  // Every staff action is inspection only: no student or staff progress is changed.
  if (access.canReview) {
    if (body.action === "solution") return response({ solution: getWorkedSolution(lesson.id), preview: true, ...state });
    if (body.action === "review") return response({ reviewed: true, preview: true, ...state });
    const question = body.action === "transfer" ? lesson.transfer : lesson.questions.find((item) => item.id === body.questionId);
    if (!question) return response({ error: "Unknown question." }, 400);
    return response({ ...gradeQuestion(lesson.id, question.id, body.response), preview: true, ...state });
  }
  if (!state.databaseReady) return response({ error: "Account progress is unavailable. Try again shortly." }, 503);
  if (!state.weekOneReady) return response({ error: "Complete induction and every Week 1 activity, including tutor approval of the Week 1 checkpoint, before Week 2." }, 409);
  const index = drawerSenseLessons.findIndex((item) => item.id === lesson.id);
  const blocked = drawerSenseLessons.slice(0, index).find((previous) => !state.progress[previous.id]?.complete);
  if (blocked) return response({ error: "Complete " + blocked.id + " before starting " + lesson.id + "." }, 409);

  const saved = state.progress[lesson.id];
  const initialChecksPassed = lesson.questions.every((question) => saved?.correct.includes(question.id));
  async function refreshed(fields: Record<string, unknown>) {
    const next = await getDrawerSenseServerProgress(access.storageScope);
    if (!next.databaseReady) return response({ error: "Your activity was recorded, but refreshed account progress is unavailable. Reload before continuing." }, 503);
    return response({ ...fields, ...next });
  }

  try {
    if (body.action === "check") {
      const question = lesson.questions.find((item) => item.id === body.questionId);
      if (!question) return response({ error: "Unknown question." }, 400);
      if (!hasWork(body.work ?? saved)) return response({ error: "Save your own prediction or working before checking an answer." }, 409);
      const grade = gradeQuestion(lesson.id, question.id, body.response);
      await recordDrawerSenseStep(access.storageScope, lesson.id, question.id, body.response ?? null, grade.correct);
      return refreshed(grade);
    }
    if (!initialChecksPassed || !saved) return response({ error: "Answer both checks correctly and save them to your account before continuing." }, 409);

    if (body.action === "solution") {
      const evidence = body.work ?? saved;
      if (!hasWork(evidence)) return response({ error: "Save your sketch or written working before opening the solution." }, 409);
      const clean = sanitizeProgress({ [lesson.id]: evidence })[lesson.id];
      const work = { ...clean, answers: saved.answers, correct: saved.correct, saved: true, reviewed: false, complete: false };
      delete work.override;
      delete work.overrideReason;
      await recordDrawerSenseStep(access.storageScope, lesson.id, DRAWERSENSE_WORK_STEP, work, true);
      return refreshed({ solution: getWorkedSolution(lesson.id) });
    }
    if (!saved.saved || !hasWork(saved)) return response({ error: "Save your working and open the worked solution before continuing." }, 409);

    if (body.action === "review") {
      if (body.reviewed !== true && body.work?.reviewed !== true) return response({ error: "Confirm that you have compared the solution with your own working." }, 409);
      await recordDrawerSenseStep(access.storageScope, lesson.id, DRAWERSENSE_REVIEW_STEP, { compared: true }, true);
      return refreshed({ reviewed: true });
    }
    if (!saved.reviewed) return response({ error: "Compare your working with the solution and save that comparison before the transfer check." }, 409);
    const grade = gradeQuestion(lesson.id, lesson.transfer.id, body.response);
    const recorded = await recordDrawerSenseStep(access.storageScope, lesson.id, lesson.transfer.id, body.response ?? null, grade.correct);
    return refreshed({ ...grade, ...recorded });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Your activity could not be saved. Try again before continuing." }, 503);
  }
}
