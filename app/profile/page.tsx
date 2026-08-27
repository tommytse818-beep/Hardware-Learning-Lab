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
  if (!viewer?.id) redirect("/login");
  if (viewer.mustChangePassword) redirect("/first-login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-slate-950 p-7 text-white sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(52,211,153,0.2),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(99,102,241,0.2),transparent_36%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <AvatarBadge name={viewer.displayName} avatarKey={viewer.avatar} size="xl" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Private programme profile</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{viewer.displayName}</h1>
                <p className="mt-2 text-sm capitalize text-slate-300">{viewer.role}</p>
              </div>
            </div>
            <Link href="/settings#profile" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Edit profile</Link>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">About</p>
            <p className="mt-3 leading-7 text-slate-700">{viewer.bio}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Leaderboard alias</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{viewer.leaderboardAlias}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Global privacy</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{viewer.leaderboardOptIn ? "Opted in" : "Hidden"}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Account email</p>
            <p className="mt-3 break-all text-slate-700">{viewer.email}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
