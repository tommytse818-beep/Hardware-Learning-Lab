import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { AvatarPicker } from "@/components/avatar-picker";
import { StatusBanner } from "@/components/status-banner";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { getRoleHome } from "@/lib/role-home";
import { completeFirstLogin } from "@/lib/settings-actions";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "First login",
  robots: { index: false, follow: false },
};

type FirstLoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function FirstLoginPage({ searchParams }: FirstLoginPageProps) {
  const { error, message } = await searchParams;
  const viewer = await getViewer();

  if (!viewer?.id) redirect("/login");
  if (!viewer.mustChangePassword) redirect(getRoleHome(viewer.role));

  return (
    <AuthShell
      eyebrow="First login"
      title="Make this school-issued account yours."
      description="Replace the temporary password, choose how your name appears and select a friendly engineering avatar."
      sideNote="Your role, email, school and course access cannot be changed from this form."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Account setup</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Complete your profile</h2>
      <div className="mt-5"><StatusBanner error={error} message={message} /></div>

      <form action={completeFirstLogin} className="mt-7 space-y-6">
        <PasswordField label="New password" name="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required hint={`Use at least ${PASSWORD_MIN_LENGTH} characters. Spaces are allowed.`} />
        <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required />
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
          <textarea id="bio" name="bio" defaultValue={viewer.bio} maxLength={280} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <input type="checkbox" name="leaderboardOptIn" defaultChecked={viewer.leaderboardOptIn} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600" />
          <span>Show my alias and avatar on the optional pseudonymous global leaderboard. My email and school remain private.</span>
        </label>
        <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700">Finish account setup</button>
      </form>
    </AuthShell>
  );
}
