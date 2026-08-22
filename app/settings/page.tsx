import type { Metadata } from "next";

import { StatusBanner } from "@/components/status-banner";
import { updateDisplaySettings } from "@/lib/settings-actions";
import { getViewer } from "@/lib/viewer";

const avatarOptions = [
  { id: "sun", label: "Sun" },
  { id: "moon", label: "Moon" },
  { id: "star", label: "Star" },
  { id: "leaf", label: "Leaf" },
];

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

type SettingsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { error, message } = await searchParams;
  const viewer = await getViewer();

  if (!viewer) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Account preferences
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Update your profile, avatar and leaderboard settings from your right-side account menu.
        </p>

        <div className="mt-6">
          <StatusBanner error={error} message={message} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form action={updateDisplaySettings} className="space-y-6">
            <section id="profile" className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 text-sm font-bold text-white">
                  {viewer.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Profile photo</p>
                  <p className="text-xs text-slate-500">Choose how your avatar appears on the cohort board.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {avatarOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="avatar"
                      value={option.id}
                      defaultChecked={viewer.avatar === option.id || (!viewer.avatar && option.id === "sun")}
                      className="h-4 w-4 text-emerald-600"
                    />
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 text-xs font-bold text-white">
                      {option.label.slice(0, 2).toUpperCase()}
                    </span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="displayName" className="text-sm font-semibold text-slate-800">
                    Display name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    defaultValue={viewer.displayName}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label htmlFor="alias" className="text-sm font-semibold text-slate-800">
                    Leaderboard alias
                  </label>
                  <input
                    id="alias"
                    name="alias"
                    defaultValue={viewer.displayName}
                    maxLength={24}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="text-sm font-semibold text-slate-800">
                    About you
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={viewer.bio}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Save profile
            </button>
          </form>

          <div className="space-y-6">
            <section id="leaderboard" className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-800">Leaderboard visibility</p>
              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="leaderboardOptIn"
                  defaultChecked={viewer.leaderboardOptIn}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Allow my pseudonymous profile to appear on the optional global leaderboard.</span>
              </label>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Cohort boards show your alias and avatar, never your school email.</li>
                <li>• Global participation remains opt-in and anonymous.</li>
              </ul>
            </section>

            <section id="about" className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-800">Account summary</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4"><dt>Role</dt><dd className="capitalize">{viewer.role}</dd></div>
                <div className="flex justify-between gap-4"><dt>Email</dt><dd>{viewer.email}</dd></div>
                <div className="flex justify-between gap-4"><dt>Privacy</dt><dd>{viewer.leaderboardOptIn ? "Visible" : "Hidden"}</dd></div>
              </dl>
              <a href="/forgot-password" className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Reset password →
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
