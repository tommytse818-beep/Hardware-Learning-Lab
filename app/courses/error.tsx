"use client";

import Link from "next/link";

export default function CourseError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl px-6 py-20">
    <p className="text-sm font-semibold text-emerald-700">Learning workspace</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">Your course could not load.</h1>
    <p className="mt-5 leading-7 text-slate-600">Your saved progress has not been changed. Try again, or return to your dashboard to check your account.</p>
    <div className="mt-7 flex flex-wrap gap-4"><button onClick={reset} className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">Try again</button><Link href="/dashboard" className="rounded-full border border-slate-300 px-6 py-3 font-semibold">Dashboard</Link></div>
  </section>;
}
