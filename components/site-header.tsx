import Link from "next/link";
import Image from "next/image";

import { UserMenu } from "@/components/user-menu";
import { getViewer } from "@/lib/viewer";
import { MobileNav } from "@/components/site-mobile-nav";

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
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-950"
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
          className="order-3 hidden items-center gap-1 sm:order-2 sm:flex sm:w-auto"
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

        <MobileNav />

        <div className="order-2 flex items-center gap-2 sm:order-3">
          <UserMenu viewer={viewer} />
        </div>
      </div>
      </header>
    </>
  );
}
