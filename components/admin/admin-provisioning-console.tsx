"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  AdminCohortSummary,
  AdminSchoolSummary,
  PortalMetric,
} from "@/lib/portal-data";

type AdminProvisioningConsoleProps = {
  metrics: PortalMetric[];
  schools: AdminSchoolSummary[];
  cohorts: AdminCohortSummary[];
};

async function submitJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string" ? payload.error : "Operation failed.",
    );
  }

  return payload;
}

export function AdminProvisioningConsole({
  metrics,
  schools,
  cohorts,
}: AdminProvisioningConsoleProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string>("");
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [busy, setBusy] = useState<string>("");

  async function run(
    name: string,
    task: () => Promise<Record<string, unknown>>,
  ) {
    setBusy(name);
    setNotice("");
    setCredentials(null);

    try {
      const result = await task();

      if (
        typeof result.temporaryPassword === "string" &&
        result.account &&
        typeof result.account === "object" &&
        "email" in result.account
      ) {
        setCredentials({
          email: String((result.account as { email: unknown }).email),
          password: result.temporaryPassword,
        });
      }

      setNotice("Saved successfully.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{metric.value}</p>
          </article>
        ))}
      </div>

      {notice && (
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {notice}
        </div>
      )}

      {credentials && (
        <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">One-time credentials</p>
          <p className="mt-3 text-sm text-amber-950">Copy these now. The plaintext password is not stored and cannot be shown again.</p>
          <dl className="mt-4 space-y-2 rounded-2xl bg-white p-4 font-mono text-sm">
            <div><dt className="text-slate-500">Email</dt><dd className="break-all text-slate-950">{credentials.email}</dd></div>
            <div><dt className="text-slate-500">Temporary password</dt><dd className="break-all text-slate-950">{credentials.password}</dd></div>
          </dl>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void run("school", () =>
              submitJson("/api/admin/schools", {
                name: form.get("name"),
                contactName: form.get("contactName"),
                contactEmail: form.get("contactEmail"),
              }),
            );
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Step 1</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Create school</h2>
          <div className="mt-5 space-y-4">
            <input name="name" required placeholder="School name" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input name="contactName" required placeholder="Contact name" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input name="contactEmail" type="email" required placeholder="Contact email" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
          </div>
          <button disabled={busy !== ""} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
            {busy === "school" ? "Saving…" : "Create school"}
          </button>
        </form>

        <form
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void run("cohort", () =>
              submitJson("/api/admin/cohorts", {
                schoolId: form.get("schoolId"),
                name: form.get("name"),
                courseSlug: form.get("courseSlug"),
                studentSeatLimit: Number(form.get("studentSeatLimit")),
              }),
            );
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">Step 2</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Create cohort</h2>
          <div className="mt-5 space-y-4">
            <select name="schoolId" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
              <option value="">Choose school</option>
              {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
            </select>
            <input name="name" required placeholder="Cohort name" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input name="courseSlug" defaultValue="open-guard-mini" required className="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input name="studentSeatLimit" type="number" min={1} max={200} defaultValue={12} required className="w-full rounded-xl border border-slate-300 px-4 py-3" />
          </div>
          <button disabled={busy !== "" || schools.length === 0} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
            {busy === "cohort" ? "Saving…" : "Create cohort"}
          </button>
        </form>

        <form
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void run("user", () =>
              submitJson("/api/admin/users", {
                cohortId: form.get("cohortId"),
                displayName: form.get("displayName"),
                email: form.get("email"),
                role: form.get("role"),
              }),
            );
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-700">Step 3</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Provision account</h2>
          <div className="mt-5 space-y-4">
            <select name="cohortId" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
              <option value="">Choose cohort</option>
              {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.schoolName} · {cohort.name}</option>)}
            </select>
            <select name="role" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <input name="displayName" required placeholder="Display name" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input name="email" type="email" required placeholder="Individual email" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
          </div>
          <button disabled={busy !== "" || cohorts.length === 0} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
            {busy === "user" ? "Creating…" : "Create individual account"}
          </button>
        </form>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Cohort overview</h2>
        {cohorts.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">No cohorts yet. Create an approved school first.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {cohorts.map((cohort) => (
              <div key={cohort.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{cohort.schoolName} · {cohort.name}</p>
                  <p className="text-sm text-slate-500">{cohort.course} · {cohort.active ? "Active" : "Inactive"}</p>
                </div>
                <p className="text-sm text-slate-700"><strong>{cohort.used}</strong> / {cohort.seats} student seats</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
