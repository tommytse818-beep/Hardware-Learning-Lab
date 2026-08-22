import { AvatarBadge } from "@/components/avatar-badge";
import { getTeacherPortalData } from "@/lib/portal-data";

export async function TeacherDashboard() {
  const data = await getTeacherPortalData();

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-5 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-950">{metric.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Learner status</h2>
        <div className="mt-5 space-y-3">
          {data.learners.map((learner) => (
            <div
              key={learner.name}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <AvatarBadge name={learner.name} size="sm" />
                <div>
                  <p className="font-semibold text-slate-900">{learner.name}</p>
                  <p className="text-slate-500">Alias: {learner.alias}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{learner.points.toLocaleString()} points</p>
                <p
                  className={
                    learner.status === "Behind target"
                      ? "text-amber-700"
                      : learner.status === "Needs review"
                        ? "text-violet-700"
                        : "text-emerald-700"
                  }
                >
                  {learner.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
