import type { Metadata } from "next";

import { StatusBanner } from "@/components/status-banner";
import { updatePassword } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Choose new password",
  robots: { index: false, follow: false },
};

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
          Secure recovery
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Choose a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This page becomes available after the newest recovery link creates a
          temporary authenticated session.
        </p>

        <div className="mt-5">
          <StatusBanner error={error} message={message} />
        </div>

        <form action={updatePassword} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-800"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-slate-800"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}
