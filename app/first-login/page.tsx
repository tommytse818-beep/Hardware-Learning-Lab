import type { Metadata } from "next";

import { StatusBanner } from "@/components/status-banner";
import { completeFirstLogin } from "@/lib/settings-actions";

export const metadata: Metadata = {
  title: "First login",
  robots: { index: false, follow: false },
};

type FirstLoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function FirstLoginPage({ searchParams }: FirstLoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          First login
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Set up your account
        </h1>
        <p className="mt-3 text-slate-600">
          This school-issued account must be completed before the programme unlocks. Choose a personal display name, optional alias and leaderboard preference.
        </p>

        <div className="mt-6">
          <StatusBanner error={error} message={message} />
        </div>

        <form action={completeFirstLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="displayName" className="text-sm font-semibold text-slate-800">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="avatar" className="text-sm font-semibold text-slate-800">
              Avatar
            </label>
            <select
              id="avatar"
              name="avatar"
              defaultValue="sun"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="sun">Sun</option>
              <option value="moon">Moon</option>
              <option value="star">Star</option>
              <option value="leaf">Leaf</option>
            </select>
          </div>

          <div>
            <label htmlFor="alias" className="text-sm font-semibold text-slate-800">
              Leaderboard alias
            </label>
            <input
              id="alias"
              name="alias"
              type="text"
              maxLength={24}
              placeholder="Aster"
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
              rows={4}
              placeholder="I enjoy building circuits and exploring practical electronics projects."
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="leaderboardOptIn" defaultChecked={false} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            I want to appear on the optional pseudonymous global leaderboard.
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue to dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
