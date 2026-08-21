import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-slate-950">
            Hardware Learning Lab
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            A Stage 1 prototype for a Hong Kong-oriented secondary-school
            electronics pathway. Learn it. Build it. Prove it.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          <Link href="/projects" className="hover:text-slate-950">
            Projects
          </Link>
          <Link href="/schools" className="hover:text-slate-950">
            For schools
          </Link>
          <Link href="/about" className="hover:text-slate-950">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
