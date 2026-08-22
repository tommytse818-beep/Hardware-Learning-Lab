import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AvatarBadge } from "@/components/avatar-badge";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <AvatarBadge name={viewer.displayName} avatarKey={viewer.avatar} size="lg" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Private profile
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {viewer.displayName}
              </h1>
            </div>
          </div>
          <Link href="/settings#profile" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-950">
            Edit profile
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 capitalize">{viewer.role}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Avatar</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 capitalize">{viewer.avatar}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
            <p className="text-sm text-slate-500">Bio</p>
            <p className="mt-2 text-base leading-7 text-slate-700">{viewer.bio}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Leaderboard alias</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{viewer.leaderboardAlias}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Leaderboard privacy</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{viewer.leaderboardOptIn ? "Visible" : "Hidden"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 text-base text-slate-700 break-all">{viewer.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
