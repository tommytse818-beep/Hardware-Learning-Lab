import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
        Page not found
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        That lesson or page does not exist.
      </h1>
      <p className="mt-4 leading-7 text-slate-600">
        Return to the dashboard and choose one of the verified course pages.
      </p>
      <Link
        href="/dashboard"
        className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Return to dashboard
      </Link>
    </div>
  );
}
