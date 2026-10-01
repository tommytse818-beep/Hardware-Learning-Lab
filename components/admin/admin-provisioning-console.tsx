"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  AdminCohortSummary,
  AdminEnquirySummary,
  AdminSchoolSummary,
  PortalMetric,
} from "@/lib/portal-data";

type AdminProvisioningConsoleProps = {
  metrics: PortalMetric[];
  schools: AdminSchoolSummary[];
  cohorts: AdminCohortSummary[];
  enquiries: AdminEnquirySummary[];
};

const enquiryStatusStyles = {
  sent: "bg-emerald-100 text-emerald-800",
  pending: "bg-slate-200 text-slate-700",
  failed: "bg-amber-100 text-amber-900",
};

const enquiryStatusLabels = {
  sent: "Notification sent",
  pending: "Notification pending",
  failed: "Saved · email alert failed",
};

function formatEnquiryDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

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
  enquiries,
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
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-3">
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
            <label className="block text-sm font-semibold text-slate-700">School name<input name="name" required placeholder="e.g. North Point College" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
            <label className="block text-sm font-semibold text-slate-700">Contact name<input name="contactName" required placeholder="Programme contact" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
            <label className="block text-sm font-semibold text-slate-700">Contact email<input name="contactEmail" type="email" required placeholder="name@school.edu.hk" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
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
            <label className="block text-sm font-semibold text-slate-700">School<select name="schoolId" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950">
              <option value="">Choose school</option>
              {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
            </select></label>
            <label className="block text-sm font-semibold text-slate-700">Cohort name<input name="name" required placeholder="e.g. Autumn STEM Club" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
            <label className="block text-sm font-semibold text-slate-700">Course<select name="courseSlug" defaultValue="open-guard-mini" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950"><option value="open-guard-mini">DrawerSense Mini</option></select></label>
            <label className="block text-sm font-semibold text-slate-700">Student seat limit<input name="studentSeatLimit" type="number" min={1} max={200} defaultValue={12} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
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
            <label className="block text-sm font-semibold text-slate-700">Cohort<select name="cohortId" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950">
              <option value="">Choose cohort</option>
              {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.schoolName} · {cohort.name}</option>)}
            </select></label>
            <label className="block text-sm font-semibold text-slate-700">Account role<select name="role" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select></label>
            <label className="block text-sm font-semibold text-slate-700">Display name<input name="displayName" required placeholder="Learner or teacher name" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
            <label className="block text-sm font-semibold text-slate-700">Individual email<input name="email" type="email" required placeholder="One unique email per person" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-950" /></label>
          </div>
          <button disabled={busy !== "" || cohorts.length === 0} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">
            {busy === "user" ? "Creating…" : "Create individual account"}
          </button>
        </form>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">
              Enquiry inbox
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Recent school enquiries
            </h2>
          </div>
          <p className="text-sm text-slate-500">Newest 20</p>
        </div>
        {enquiries.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No school enquiries have been submitted yet.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {enquiries.map((enquiry) => (
              <article
                key={enquiry.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {enquiry.schoolName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {enquiry.contactName} ·{" "}
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        {enquiry.email}
                      </a>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${enquiryStatusStyles[enquiry.notificationStatus]}`}
                  >
                    {enquiryStatusLabels[enquiry.notificationStatus]}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {enquiry.message}
                </p>
                <time
                  dateTime={enquiry.createdAt}
                  className="mt-4 block border-t border-slate-200 pt-3 text-xs text-slate-500"
                >
                  Received {formatEnquiryDate(enquiry.createdAt)} UK time
                </time>
              </article>
            ))}
          </div>
        )}
      </section>

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
