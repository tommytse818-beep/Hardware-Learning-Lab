import { AvatarBadge } from "@/components/avatar-badge";
import { getStudentPortalData } from "@/lib/portal-data";

export async function StudentDashboard() {
  const data = await getStudentPortalData();

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <AvatarBadge name="Student" size="md" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Cohort leaderboard
              </p>
              <h2 className="mt-1 text-2xl font-semibold">This week</h2>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-3">
            {data.leaderboard.map((item, index) => (
              <div
                key={item.alias}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400">#{index + 1}</span>
                  <AvatarBadge name={item.alias} size="sm" />
                  <span className="font-semibold text-slate-900">{item.alias}</span>
                </div>
                <span className="font-semibold text-slate-700">{item.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
          Progress snapshot
        </p>
        <dl className="mt-5 space-y-4">
          {data.progress.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0"
            >
              <dt className="text-slate-600">{item.label}</dt>
              <dd className="text-right font-semibold text-slate-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
