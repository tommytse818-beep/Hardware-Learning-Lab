"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AvatarBadge } from "@/components/avatar-badge";
import { signOut } from "@/lib/auth-actions";
import type { Viewer } from "@/lib/viewer";

type UserMenuProps = {
  viewer?: Viewer | null;
};

export function UserMenu({ viewer }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        buttonRef.current?.focus();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!viewer) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
            <circle cx="10" cy="7" r="3.5" />
            <path d="M20 19v-1a4 4 0 0 0-3-3.87" />
            <path d="M18 4.5a3.5 3.5 0 0 1 0 7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-14 z-50 w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
            <div className="space-y-1 px-2 py-2">
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                School-issued access
              </Link>
              <Link href="/schools" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Request a school quotation
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  const roleHref = viewer.role === "admin" ? "/admin" : viewer.role === "teacher" ? "/teacher" : "/dashboard";
  const roleLabel = viewer.role === "admin" ? "Admin workspace" : viewer.role === "teacher" ? "Teacher workspace" : "Dashboard";

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
      >
        <AvatarBadge name={viewer.displayName} avatarKey={viewer.avatar} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[min(272px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-3">
            <AvatarBadge name={viewer.displayName} avatarKey={viewer.avatar} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{viewer.displayName}</p>
              <p className="truncate text-xs text-slate-500">
                {viewer.role === "admin" ? "Administrator" : viewer.role === "teacher" ? "Teacher" : "Student"}
              </p>
            </div>
          </div>

          <div className="space-y-1 px-2 py-2">
            <Link href={roleHref} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {roleLabel}
            </Link>
            <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Profile
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Settings
            </Link>
          </div>

          <div className="border-t border-slate-200 px-2 py-2">
            <form action={signOut}>
              <button type="submit" className="w-full rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
