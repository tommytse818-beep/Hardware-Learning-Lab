const views = [
  { label: "Student", title: "Your pathway", detail: "6 / 10 checkpoints", items: ["Continue from the next approved step", "Progress evidence stays visible", "Peer ranking: PLANNED"] },
  { label: "Teacher", title: "Class progress", detail: "12 fictional learners", items: ["Review practical evidence", "Set the current target", "Request a revision"] },
  { label: "Admin", title: "Cohort management", detail: "12 demo seats", items: ["Assign a course", "Issue individual accounts", "Manage teacher access"] },
] as const;

export function PlatformPreview() {
  return (
    <section aria-labelledby="platform-preview-title" className="bg-slate-950 py-24 text-white sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Learning platform</p>
        <h2 id="platform-preview-title" className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">A clear next step. For everyone.</h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Progress for students. Evidence for teachers. Control for schools.</p>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {views.map((view) => (
            <article key={view.label} className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950 shadow-2xl">
              <div className="flex items-center justify-between bg-slate-800 px-5 py-4 text-white"><span className="font-bold uppercase tracking-[0.14em] text-emerald-300">{view.label}</span><span className="rounded-full border border-white/20 px-2.5 py-1 text-[0.65rem] font-bold">DEMO</span></div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{view.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{view.detail}</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true"><div className="h-full w-3/5 rounded-full bg-emerald-500" /></div>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700">{view.items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="text-emerald-600">✓</span><span>{item}</span></li>)}</ul>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-xl font-semibold">AI can coach. Instructors approve.</p>
        <p className="mt-3 text-center text-sm text-slate-400">Fictional demonstration data. Leaderboard display is planned; AI support is a January 2027 pilot target.</p>
      </div>
    </section>
  );
}