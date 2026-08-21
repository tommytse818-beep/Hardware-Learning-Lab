import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For schools",
};

const deliveryOptions = [
  {
    title: "Pre-assembled",
    description:
      "The difficult surface-mount and power sections are factory assembled. Students connect modules, program and measure.",
  },
  {
    title: "Student-soldered",
    description:
      "Sensitive sections remain assembled while older students solder large through-hole parts under supervision.",
  },
  {
    title: "PCB keepsake",
    description:
      "One standardized board is personalized through firmware, enclosure, labels and a built-by area rather than expensive one-off fabrication.",
  },
];

export default function SchoolsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            September 2027 target
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            A controlled first school programme, not an oversized launch.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            The first package is intended for approximately ages 13–16 and
            focuses on one complete Smart Door Lab pathway. Schools receive
            teacher guidance, student access, reusable kits and a PCB capstone
            option.
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">
            Prototype package contents
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 4–8 guided lessons</li>
            <li>• Reusable low-voltage hardware kits</li>
            <li>• Verified questions and explanations</li>
            <li>• Student progress and practical evidence</li>
            <li>• Teacher demonstration account</li>
            <li>• Optional PCB keepsake</li>
          </ul>
        </aside>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {deliveryOptions.map((option) => (
          <article
            key={option.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {option.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {option.description}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-indigo-950">
          What should be proven before approaching many schools?
        </h2>
        <div className="mt-5 grid gap-4 text-sm leading-6 text-indigo-950 md:grid-cols-2">
          <p>
            At least 80% of students should complete a working circuit, and a
            teacher should be able to prepare a lesson without depending on the
            founder for every step.
          </p>
          <p>
            The pilot should also record routine questions, hardware failures,
            AI or tutor escalations, lesson timing and whether the school wants
            to run the programme again.
          </p>
        </div>
      </section>
    </div>
  );
}
