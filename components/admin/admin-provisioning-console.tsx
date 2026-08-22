import { AvatarBadge } from "@/components/avatar-badge";
import { getAdminPortalData } from "@/lib/portal-data";

export async function AdminProvisioningConsole() {
  const data = await getAdminPortalData();

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
        <h2 className="text-xl font-semibold text-slate-950">Cohort overview</h2>
        <div className="mt-5 space-y-4">
          {data.cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <AvatarBadge name={cohort.name} size="sm" />
                <div>
                  <p className="font-semibold text-slate-900">{cohort.name}</p>
                  <p className="text-sm text-slate-500">{cohort.course}</p>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{cohort.used}</span> / {cohort.seats} seats used
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
