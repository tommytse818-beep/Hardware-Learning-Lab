"use client";

import { useState } from "react";

import { AvatarBadge } from "@/components/avatar-badge";
import type { PortalMetric, TeacherCohort } from "@/lib/portal-data";

type TeacherDashboardProps = {
  metrics: PortalMetric[];
  cohorts: TeacherCohort[];
};

async function post(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Operation failed.");
}

export function TeacherDashboard({ metrics, cohorts }: TeacherDashboardProps) {
  const [notice, setNotice] = useState("");

  async function run(task: () => Promise<void>) {
    setNotice("");
    try {
      await task();
      setNotice("Saved successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Operation failed.");
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{metric.value}</p>
          </article>
        ))}
      </div>

      {notice && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{notice}</div>}

      {cohorts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">No active cohort is assigned to this teacher account.</div>
      ) : (
        cohorts.map((cohort) => (
          <section key={cohort.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">Assigned cohort</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{cohort.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{cohort.course}</p>
              </div>
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  void run(() =>
                    post("/api/teacher/cohort-target", {
                      cohortId: cohort.id,
                      targetLessonSlug: form.get("targetLessonSlug"),
                    }),
                  );
                }}
              >
                <input name="targetLessonSlug" defaultValue={cohort.targetLessonSlug ?? ""} required placeholder="Target lesson slug" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
                <button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Save target</button>
              </form>
            </div>

            <div className="mt-6 space-y-3">
              {cohort.learners.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No students are assigned yet.</p>
              ) : (
                cohort.learners.map((learner) => (
                  <article key={learner.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <AvatarBadge name={learner.name} avatarKey={learner.avatar} size="md" />
                    <div>
                      <p className="font-semibold text-slate-950">{learner.name}</p>
                      <p className="text-sm text-slate-500">{learner.alias} · {learner.completed} complete · {learner.points} points</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        learner.status === "On track"
                          ? "bg-emerald-100 text-emerald-800"
                          : learner.status === "Behind target"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-200 text-slate-700"
                      }`}>{learner.status}</span>
                      <button
                        type="button"
                        onClick={() =>
                          void run(() =>
                            post("/api/teacher/reminders", {
                              cohortId: cohort.id,
                              studentId: learner.id,
                            }),
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-950"
                      >
                        Send reminder
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
