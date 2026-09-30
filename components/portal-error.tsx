"use client";

import Link from "next/link";

export function PortalError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl px-6 py-20">
    <p className="text-sm font-semibold text-emerald-700">School workspace</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">The workspace could not load.</h1>
    <p className="mt-5 leading-7 text-slate-600">We could not retrieve the account and cohort records. Try again to reconnect. No changes were made by this page load.</p>
    <div className="mt-7 flex flex-wrap gap-4"><button onClick={reset} className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">Try again</button><Link href="/dashboard" className="rounded-full border border-slate-300 px-6 py-3 font-semibold">Dashboard</Link></div>
  </section>;
}
