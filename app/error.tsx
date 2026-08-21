"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
        Page error
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        This part of the prototype could not load.
      </h1>
      <p className="mt-4 leading-7 text-slate-600">
        Retry the page. During development, also check the VS Code terminal for
        the detailed error message.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
