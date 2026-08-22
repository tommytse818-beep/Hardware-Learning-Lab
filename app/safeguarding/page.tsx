import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safeguarding",
  description: "Safeguarding information for Hardware Learning Lab pilots.",
};

export default function SafeguardingPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-emerald-700">Pilot-stage information</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950">Safeguarding</h1>
      <p className="mt-6 leading-8 text-slate-600">
        Practical electronics activities require human supervision, appropriate
        equipment checks and school safeguarding procedures. The platform does not
        replace a school&apos;s safeguarding lead, teacher supervision or local safety
        guidance.
      </p>
      <p className="mt-4 leading-8 text-slate-600">
        School staff should confirm safeguarding responsibilities and reporting
        arrangements before a pilot begins. Please use the school enquiry contact
        route for questions, and do not include learner personal information.
      </p>
    </article>
  );
}
