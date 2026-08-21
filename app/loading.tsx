export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading page</span>
      <div className="animate-pulse space-y-5">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="h-11 max-w-2xl rounded-xl bg-slate-200" />
        <div className="h-5 max-w-3xl rounded bg-slate-200" />
        <div className="grid gap-5 pt-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-44 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
