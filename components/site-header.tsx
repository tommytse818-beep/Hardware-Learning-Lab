import Link from "next/link";

import { signOut } from "@/lib/auth-actions";
import { getViewer } from "@/lib/viewer";

const publicLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/schools", label: "For schools" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-950"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
            HL
          </span>
          <span>
            Hardware Learning Lab
            <span className="block text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-500">
              Prototype
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-2 sm:w-auto"
        >
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {viewer ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950"
              >
                {viewer.demo ? "Open demo" : "Dashboard"}
              </Link>
              {!viewer.demo && (
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
