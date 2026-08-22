"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/schools", label: "For schools" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="order-3 relative sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
        className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 text-slate-800"
      >
        <span aria-hidden="true" className="text-xl leading-none">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute right-0 top-14 z-50 grid min-w-48 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}