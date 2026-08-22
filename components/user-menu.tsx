"use client";

import Link from "next/link";
import { useState } from "react";

import { AvatarBadge } from "@/components/avatar-badge";
import { signOut } from "@/lib/auth-actions";
import type { Viewer } from "@/lib/viewer";

type UserMenuProps = {
  viewer: Viewer;
};

const avatarStyles: Record<string, string> = {
  sun: "from-amber-400 to-orange-500",
  moon: "from-slate-400 to-indigo-500",
  star: "from-violet-400 to-fuchsia-500",
  leaf: "from-emerald-400 to-teal-500",
};

export function UserMenu({ viewer }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const avatarClass = avatarStyles[viewer.avatar] ?? "from-emerald-400 via-cyan-400 to-indigo-500";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-slate-300"
      >
        <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${avatarClass} text-xs font-bold text-white`}>
          {viewer.displayName.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden text-sm font-semibold text-slate-800 sm:inline">{viewer.displayName}</span>
        <span aria-hidden="true" className="text-base text-slate-500">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-3">
            <AvatarBadge name={viewer.displayName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{viewer.displayName}</p>
              <p className="truncate text-xs text-slate-500">{viewer.email}</p>
            </div>
          </div>

          <div className="space-y-1 px-2 py-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Profile & settings
            </Link>
            <Link
              href="/settings#leaderboard"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Leaderboard preferences
            </Link>
            <Link
              href="/settings#about"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              About / profile text
            </Link>
          </div>

          <div className="border-t border-slate-200 px-2 py-2">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
