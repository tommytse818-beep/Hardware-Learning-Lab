import Link from "next/link";

const themes = [
  {
    title: "Smart living",
    description: "Door alarms, lighting, lockers and useful home systems.",
    status: "Flagship",
  },
  {
    title: "Climate",
    description: "Plant care, room climate and environmental data logging.",
    status: "Roadmap",
  },
  {
    title: "Health & movement",
    description: "Reaction timing, posture and non-medical activity sensing.",
    status: "Roadmap",
  },
  {
    title: "Space & communications",
    description: "Telemetry, sensor packets and classroom wireless links.",
    status: "Roadmap",
  },
];

const pathway = [
  "Understand the circuit",
  "Build and measure it",
  "Program the ESP32",
  "Check the schematic and PCB",
];

export default function HomePage() {
  return (
    <div>
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              Hong Kong school pilot target · September 2027
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl">
              Learn electronics by building something real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A guided pathway from logic gates and electrical measurements to
              ESP32 firmware and a verified PCB capstone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open the learning demo
              </Link>
              <Link
                href="/schools"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-950"
              >
                View the school pathway
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">
              Learn it. Build it. Prove it.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/50 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                    Smart Door Lab
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    One product. Four engineering layers.
                  </h2>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-2xl">
                  ⚡
                </span>
              </div>

              <div className="mt-7 space-y-3">
                {pathway.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400 font-bold text-slate-950">
                      {index + 1}
                    </span>
                    <p className="font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-400 p-4 text-slate-950">
                <p className="text-sm font-semibold">
                  Final outcome: a personalized low-voltage PCB product that
                  the student can keep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Focused startup direction
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Start with one reusable platform, then expand by theme.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Ten to fifteen ideas can appear on the roadmap, but only the Smart
            Door Lab needs to be fully production-ready for the first school
            pilot.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {themes.map((theme) => (
            <article
              key={theme.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-slate-600">
                {theme.status}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {theme.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {theme.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            {
              number: "01",
              title: "Human-verified curriculum",
              text: "Questions, expected answers and technical boundaries come from approved course material.",
            },
            {
              number: "02",
              title: "Guided tutor",
              text: "The tutor gives hints, simpler explanations and diagnostic prompts instead of completing the whole task.",
            },
            {
              number: "03",
              title: "Evidence of learning",
              text: "Quizzes, measurements, firmware checks and PCB rules create a meaningful project record.",
            },
          ].map((item) => (
            <article key={item.number}>
              <p className="text-sm font-black text-emerald-700">
                {item.number}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
