import Image from "next/image";
import Link from "next/link";

const journey = [
  { number: "01", title: "Understand" },
  { number: "02", title: "Build" },
  { number: "03", title: "Program" },
  { number: "04", title: "Verify" },
];

const programmeFeatures = [
  { title: "Real user need", text: "Start from a clear problem, not a random circuit idea." },
  { title: "Sensors and logic", text: "Translate behaviour into signals, states and decisions." },
  { title: "ESP32 firmware", text: "Code the logic that turns an input into an action." },
  { title: "PCB design and verification", text: "Check the schematic and final behaviour against the requirement." },
  { title: "A result students can keep", text: "The product is tangible, explainable and ready for review." },
];

const principles = [
  { title: "Human-verified learning", text: "The course is grounded in reviewed engineering principles, not AI-generated magic." },
  { title: "Guided support, not answer dumping", text: "Students are prompted, checked and encouraged to reason through each step." },
  { title: "Evidence from real work", text: "Quizzes and practical checkpoints create a trail of engineering evidence." },
];

const schoolBenefits = [
  "Clear online preparation before the workshop",
  "Live guided teaching during the practical build",
  "Physical electronics work students can explain confidently",
  "Teacher-visible progress and learning checkpoints",
];

const futureThemes = [
  "Smart living",
  "Sustainability and climate",
  "Health and movement",
  "Space and communications",
];

export default function HomePage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2),transparent_30%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200/30 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-emerald-200">
              Practical electronics for secondary schools
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Learn electronics by building something real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A guided pathway from logic and electrical measurement to ESP32 firmware and a verified PCB product students can explain with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects/open-guard-mini" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Explore OpenGuard Mini
              </Link>
              <Link href="/schools" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/8">
                For schools
              </Link>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-200">
              Hong Kong school pilot · September 2027
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-emerald-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-900/30 backdrop-blur-sm sm:p-6">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
                <Image
                  src="/images/projects/open-guard-mini/open-guard-product-concept.webp"
                  alt="OpenGuard Mini product concept"
                  width={1200}
                  height={900}
                  className="h-[360px] w-full object-cover"
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {journey.map((item) => (
                  <div key={item.number} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-emerald-200">{item.number}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">OpenGuard Mini</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">The flagship programme in this learning platform.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {programmeFeatures.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">{feature.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Why this approach</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A practical route from need to evidence.</h2>
            <div className="mt-8 space-y-5">
              {principles.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-200 sm:p-6">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
              <Image
                src="/images/projects/open-guard-mini/open-guard-system-map.webp"
                alt="System map for the OpenGuard Mini product"
                width={1200}
                height={900}
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-100/70 py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Designed for schools</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A classroom-ready programme with clear learning stages.</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {schoolBenefits.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Future themes</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Other directions are planned, but OpenGuard is the current flagship.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {futureThemes.map((theme) => (
            <article key={theme} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-950">{theme}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A future pathway for applied electronics and product design in school settings.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Next step</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Help students see technology as something they can shape.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/projects/open-guard-mini" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Explore OpenGuard Mini
            </Link>
            <Link href="/schools" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/8">
              Speak with the school team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
