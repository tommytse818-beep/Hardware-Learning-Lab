import type { Metadata } from "next";

import { AdminProvisioningConsole } from "@/components/admin/admin-provisioning-console";
import { requireViewerRole } from "@/lib/authorization";
import { getAdminPortalData } from "@/lib/portal-data";

export const metadata: Metadata = {
  title: "Admin portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const viewer = await requireViewerRole(["admin"]);
  const data = await getAdminPortalData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Trusted administrator workspace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Provision the programme without sharing secrets.</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-300">Welcome, {viewer.displayName}. Create an approved school, set an exact cohort seat limit, assign OpenGuard Mini and issue one individual account per learner or teacher.</p>
      </section>
      <AdminProvisioningConsole metrics={data.metrics} schools={data.schools} cohorts={data.cohorts} />
    </div>
  );
}
