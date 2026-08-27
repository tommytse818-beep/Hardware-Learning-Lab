import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AvatarPicker } from "@/components/avatar-picker";
import { PasswordField } from "@/components/auth/password-field";
import { StatusBanner } from "@/components/status-banner";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import {
  updateDisplaySettings,
  updatePasswordFromSettings,
} from "@/lib/settings-actions";
import { getViewer } from "@/lib/viewer";

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

  if (!viewer?.id) redirect("/login");
  if (viewer.mustChangePassword) redirect("/first-login");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Settings</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-slate-950">Your account, clearly separated.</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">You can change presentation and security settings. Trusted school, role and access records remain administrator-controlled.</p>
      <div className="mt-6"><StatusBanner error={error} message={message} /></div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form action={updateDisplaySettings} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">Profile and privacy</h2>
          <AvatarPicker defaultValue={viewer.avatar} />
          <div>
            <label htmlFor="displayName" className="text-sm font-semibold text-slate-800">Display name</label>
            <input id="displayName" name="displayName" defaultValue={viewer.displayName} maxLength={60} required className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
          </div>
          <div>
            <label htmlFor="alias" className="text-sm font-semibold text-slate-800">Leaderboard alias</label>
            <input id="alias" name="alias" defaultValue={viewer.leaderboardAlias} maxLength={32} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm font-semibold text-slate-800">About you</label>
            <textarea id="bio" name="bio" defaultValue={viewer.bio} maxLength={280} rows={5} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input type="checkbox" name="leaderboardOptIn" defaultChecked={viewer.leaderboardOptIn} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600" />
            <span>Show my alias and avatar on the optional pseudonymous global leaderboard.</span>
          </label>
          <button type="submit" className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-slate-800">Save profile</button>
        </form>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Trusted account information</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="break-all text-right font-semibold text-slate-900">{viewer.email}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Role</dt><dd className="capitalize font-semibold text-slate-900">{viewer.role}</dd></div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-slate-500">These records are controlled by the verified school workflow.</p>
          </section>

          <form action={updatePasswordFromSettings} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Change password</h2>
            <PasswordField label="Current password" name="currentPassword" autoComplete="current-password" required />
            <PasswordField label="New password" name="newPassword" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required hint={`Use at least ${PASSWORD_MIN_LENGTH} characters.`} />
            <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required />
            <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white hover:bg-emerald-700">Update password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
