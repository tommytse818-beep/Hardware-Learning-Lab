import Link from "next/link";
import Image from "next/image";

import { UserMenu } from "@/components/user-menu";
import { getViewer } from "@/lib/viewer";

const publicLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/schools", label: "For schools" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 font-semibold tracking-tight text-slate-950"
        >
          <Image
            src="/logo.svg"
            alt="Hardware Learning Lab logo"
            width={240}
            height={96}
            priority
            loading="eager"
            sizes="(max-width: 640px) 140px, 240px"
            className="h-16 w-auto object-contain max-sm:h-14"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex min-w-0 shrink items-center gap-1 overflow-x-auto"
        >
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 max-sm:px-2 max-sm:text-xs"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-50 flex shrink-0 items-center gap-2">
          <UserMenu viewer={viewer} />
        </div>
      </div>
      </header>
    </>
  );
}
