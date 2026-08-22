import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility information for Hardware Learning Lab.",
};

export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-emerald-700">Pilot-stage information</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950">Accessibility</h1>
      <p className="mt-6 leading-8 text-slate-600">
        We are building the platform so learners can use its lessons, controls and
        forms with keyboard navigation, clear focus states and reduced motion.
        Accessibility issues can be reported through the school enquiry route at
        <a className="ml-1 underline" href="/schools#contact">the contact section</a>.
      </p>
      <p className="mt-4 leading-8 text-slate-600">
        Accessibility arrangements for a school pilot should be reviewed with the
        school before learner data is collected.
      </p>
    </article>
  );
}
