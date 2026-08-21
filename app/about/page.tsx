import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
        About the prototype
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        A practical bridge into hardware engineering.
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        The platform is being designed around real electronics work: reading a
        schematic, building safely, measuring signals, debugging firmware and
        checking a PCB before fabrication.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            What this Stage 1 code proves
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• A clean public website and project roadmap.</li>
            <li>• Email/password account flows through Supabase.</li>
            <li>• Protected dashboard and course pages.</li>
            <li>• Previous/next lesson navigation and server-checked quizzes.</li>
            <li>• A fast, human-verified tutor interface without AI cost.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-semibold">What comes later</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Live AI explanations restricted to approved lesson context.</li>
            <li>• Teacher classes, invitations and progress analytics.</li>
            <li>• Video hosting, certificates and PCB submission checks.</li>
            <li>• Traditional Chinese localization and school pilot tools.</li>
          </ul>
        </section>
      </div>

      <section
        id="setup"
        className="mt-10 scroll-mt-28 rounded-2xl border border-amber-200 bg-amber-50 p-6"
      >
        <h2 className="text-xl font-semibold text-amber-950">
          Where the account setup is located
        </h2>
        <p className="mt-3 text-sm leading-6 text-amber-900">
          Open the downloaded project folder and read <strong>README.md</strong>.
          Your Supabase keys go into <strong>.env.local</strong>, and the secure
          progress-table setup is in <strong>supabase/schema.sql</strong>.
        </p>
      </section>
    </div>
  );
}
