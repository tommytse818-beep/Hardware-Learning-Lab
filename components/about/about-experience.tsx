"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { sectorCatalog } from "@/lib/sectors";

const learningSteps = [
  {
    number: "01",
    title: "Explore",
    text: "Short, visual online learning makes the idea clear before the workshop begins.",
  },
  {
    number: "02",
    title: "Make",
    text: "Students handle real components and turn an idea into a physical system.",
  },
  {
    number: "03",
    title: "Test",
    text: "They measure, troubleshoot and improve instead of being told that the answer is correct.",
  },
  {
    number: "04",
    title: "Explain",
    text: "Every learner finishes able to show what they built, how it works and what they would change next.",
  },
];

const sectorIcons = {
  "smart-living": HomeCircuitIcon,
  "sustainability-climate": ClimateLeafIcon,
  "health-movement": HealthPulseIcon,
  "space-communications": SatelliteIcon,
} as const;

const sectors = sectorCatalog.map((sector) => ({
  ...sector,
  text: sector.summary,
  icon: sectorIcons[sector.id],
  accent:
    sector.id === "smart-living"
      ? "from-fuchsia-500/80 via-indigo-500/35 to-transparent"
      : sector.id === "sustainability-climate"
        ? "from-emerald-500/80 via-lime-400/30 to-transparent"
        : sector.id === "health-movement"
          ? "from-rose-500/80 via-orange-400/30 to-transparent"
          : "from-sky-500/80 via-violet-500/35 to-transparent",
}));

const team = [
  {
    name: "Tommy Tse",
    role: "Founder & Programme Lead",
    description:
      "Leads programme strategy, course design, live delivery, electronics development and the learning platform.",
    image: "/images/about/tommy-tse-founder.webp",
    initials: "TT",
    linkedin: "https://www.linkedin.com/in/tommy-tse-99a906286/",
  },
  {
    name: "Kitty Wong",
    role: "Business & Learner Experience",
    description:
      "Supports school relationships, customer service, marketing, advertising and learner-facing operations.",
    initials: "KW",
  },
  {
    name: "Edison Chan",
    role: "Web Development Support",
    description:
      "Supports platform implementation, web development, technical maintenance and future digital features.",
    initials: "EC",
  },
];

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M4 10h11m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M7 13 13.5 6.5M9 6.5h4.5V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 12.5v2A1.5 1.5 0 0 1 11.5 16h-7A1.5 1.5 0 0 1 3 14.5v-7A1.5 1.5 0 0 1 4.5 6h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2.8c.8 4.3 2.9 6.4 7.2 7.2-4.3.8-6.4 2.9-7.2 7.2-.8-4.3-2.9-6.4-7.2-7.2C9.1 9.2 11.2 7.1 12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 16.5c.3 1.7 1.2 2.6 3 3-1.8.4-2.7 1.3-3 3-.4-1.7-1.3-2.6-3-3 1.7-.4 2.6-1.3 3-3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeCircuitIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M5 14.5 16 5l11 9.5V27H9V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 27v-8h8v8M7 11h4V7h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="11" r="1.8" fill="currentColor" />
      <circle cx="15" cy="7" r="1.8" fill="currentColor" />
    </svg>
  );
}

function ClimateLeafIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M25.5 6.5C16 7 8.5 11.2 8.5 19.2c0 4.2 3 7.3 7.3 7.3 8 0 10.1-8.8 9.7-20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 27c4-7.6 9.1-11.2 15.5-14.3M17 18c.3 2.4 1.2 4.2 2.8 5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HealthPulseIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M16 27.2S5.5 21 5.5 12.8A6.2 6.2 0 0 1 16 8.3a6.2 6.2 0 0 1 10.5 4.5C26.5 21 16 27.2 16 27.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 16h6l2.1-4 3.2 8 2.5-5H28"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SatelliteIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M9.2 20.5a9.5 9.5 0 0 0 12.6-12.6L9.2 20.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m17.2 12.6 2.2 2.2M13.5 19.1l-4.8 4.8M6 26.6l2.7-2.7 2.7 2.7M22.4 6.2c2.1.5 3.9 2.3 4.4 4.4M23.2 2.7c3.8.8 6.3 3.3 7.1 7.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircuitConstellation() {
  return (
    <svg aria-hidden="true" viewBox="0 0 640 380" className="h-full w-full" fill="none">
      <path
        d="M35 293h94v-72h88v-86h86v63h91v-92h91v70h120"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".65"
      />
      <path
        d="M88 84h75v53h62M363 270h70v-44h89M283 65v65"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="7 11"
        opacity=".35"
      />
      {[
        [35, 293],
        [129, 221],
        [217, 135],
        [303, 198],
        [394, 106],
        [485, 176],
        [605, 176],
        [88, 84],
        [163, 137],
        [363, 270],
        [433, 226],
        [522, 226],
        [283, 65],
      ].map(([cx, cy], index) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={index % 3 === 0 ? 7 : 4} fill="currentColor" opacity={index % 3 === 0 ? 0.95 : 0.55} />
          {index % 3 === 0 && <circle cx={cx} cy={cy} r="15" stroke="currentColor" opacity=".18" />}
        </g>
      ))}
    </svg>
  );
}

function TeamPlaceholder({ initials }: { initials: string }) {
  return (
    <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[1.8rem] bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(99,102,241,0.4),transparent_38%)]" />
      <div className="about-avatar-grid absolute inset-0 opacity-35" />
      <span className="relative text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{initials}</span>
      <span className="absolute bottom-4 right-4 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
    </div>
  );
}

export function AboutExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-about-reveal]"));

    let observer: IntersectionObserver | undefined;

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
      );
      revealItems.forEach((item) => observer?.observe(item));
    }

    let pointerFrame = 0;
    let scrollFrame = 0;

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion || !finePointer) return;
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
        const y = event.clientY / Math.max(window.innerHeight, 1);
        root.style.setProperty("--about-v2-x", `${((x - 0.5) * 18).toFixed(2)}px`);
        root.style.setProperty("--about-v2-y", `${((y - 0.5) * 12).toFixed(2)}px`);
        root.style.setProperty("--about-v2-x-slow", `${((0.5 - x) * 7).toFixed(2)}px`);
        root.style.setProperty("--about-v2-y-slow", `${((0.5 - y) * 5).toFixed(2)}px`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--about-v2-x", "0px");
      root.style.setProperty("--about-v2-y", "0px");
      root.style.setProperty("--about-v2-x-slow", "0px");
      root.style.setProperty("--about-v2-y-slow", "0px");
    };

    const updateScroll = () => {
      if (reducedMotion) return;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.6);
        root.style.setProperty("--about-v2-scroll", `${(progress * 34).toFixed(2)}px`);
        root.style.setProperty("--about-v2-scroll-slow", `${(-progress * 13).toFixed(2)}px`);
      });
    };

    root.addEventListener("pointermove", updatePointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer);
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      observer?.disconnect();
      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", updateScroll);
      window.cancelAnimationFrame(pointerFrame);
      window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return (
    <div ref={rootRef} className="about-v2 overflow-hidden bg-[#f5f5f7] text-slate-950">
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#05070c] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/about/stem-workshop-hero.webp"
            alt=""
            fill
            priority
            className="about-v2-hero-image object-cover object-center opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,12,0.98)_0%,rgba(5,7,12,0.84)_48%,rgba(5,7,12,0.3)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.08)_0%,rgba(5,7,12,0.08)_58%,rgba(5,7,12,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(56,189,248,0.22),transparent_26%),radial-gradient(circle_at_70%_72%,rgba(52,211,153,0.2),transparent_30%)]" />
        </div>

        <div className="about-v2-grid absolute inset-0 opacity-25" />
        <div className="about-v2-glow about-v2-glow-one" />
        <div className="about-v2-glow about-v2-glow-two" />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl items-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="grid w-full gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div className="max-w-4xl">
              <div
                data-about-reveal
                className="about-v2-reveal inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.19em] text-emerald-200 backdrop-blur-xl"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
                A practical STEM education company
              </div>

              <h1
                data-about-reveal
                className="about-v2-reveal mt-7 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl lg:text-[6.25rem]"
              >
                Make technology feel buildable.
              </h1>

              <p
                data-about-reveal
                className="about-v2-reveal mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl"
              >
                Hardware Learning Lab helps secondary-school students move beyond passive lessons and into the real work of engineering: questioning, building, testing and explaining technology with confidence.
              </p>

              <div data-about-reveal className="about-v2-reveal mt-9 flex flex-wrap gap-3">
                <Link
                  href="/schools"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
                >
                  Partner with us
                  <ArrowRightIcon />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.1]"
                >
                  Explore the programme
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>

            <div data-about-reveal className="about-v2-reveal lg:justify-self-end">
              <div className="about-v2-float w-full max-w-md rounded-[2rem] border border-white/15 bg-slate-950/55 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Our model</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["Clear online learning", "Live school workshops", "Real electronics", "Evidence of progress"].map((item, index) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <span className="text-xs font-bold text-emerald-300">0{index + 1}</span>
                      <p className="mt-2 text-sm font-semibold leading-5 text-white">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-300">
                  Not lecture-only. Not kit-copying. A guided journey from curiosity to a working, explainable result.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-about-reveal className="about-v2-reveal max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Why we exist</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.052em] text-slate-950 sm:text-6xl lg:text-7xl">
              STEM should be something students experience, not only something they are told about.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
            <div data-about-reveal className="about-v2-reveal relative overflow-hidden rounded-[2.4rem] bg-slate-950 p-2 shadow-[0_30px_100px_rgba(15,23,42,0.16)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/about/electronics-making.webp"
                  alt="Engineer building and soldering an electronics project at a workbench"
                  fill
                  className="object-cover transition duration-700 hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 52vw, 92vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(2,6,23,0.78)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="max-w-xl text-xl font-medium leading-8 text-white sm:text-2xl">
                    The moment a real circuit behaves differently from the diagram is where engineering begins.
                  </p>
                </div>
              </div>
            </div>

            <div data-about-reveal className="about-v2-reveal lg:pl-6">
              <p className="text-lg leading-8 text-slate-600">
                We create structured STEM programmes for schools that combine digital learning, live guidance and hands-on engineering. Students first understand the idea, then work with real components, observe real behaviour and make decisions from evidence.
              </p>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                The goal is not to turn every learner into an engineer overnight. It is to remove the feeling that electronics, sensors and intelligent systems belong inside a sealed box that only experts can open.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Real-world context before formulas",
                  "Small steps without removing challenge",
                  "Building and measurement alongside theory",
                  "A result learners can explain with pride",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-[#f5f5f7] p-4 text-sm font-semibold leading-6 text-slate-700">
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.15),transparent_32%)]" />
        <div className="absolute right-[-12rem] top-[-5rem] h-[34rem] w-[42rem] text-sky-300/20">
          <CircuitConstellation />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-about-reveal className="about-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">How learning moves</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Online learning that ends in the physical world.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              The platform prepares the learner. The workshop makes the idea tangible. Testing turns activity into understanding.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map((step, index) => (
              <article
                key={step.title}
                data-about-reveal
                className="about-v2-reveal rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur sm:p-7"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black tracking-[0.14em] text-emerald-300">{step.number}</span>
                  <SparkIcon className="h-5 w-5 text-sky-300" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
          <div data-about-reveal className="about-v2-reveal relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-emerald-200/70 via-sky-200/30 to-indigo-200/70 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-2 shadow-[0_35px_110px_rgba(15,23,42,0.2)]">
              <div className="relative aspect-square overflow-hidden rounded-[2.1rem] bg-slate-200">
                <Image
                  src="/images/about/tommy-tse-founder.webp"
                  alt="Tommy Tse, founder of Hardware Learning Lab"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 88vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent p-7 pt-24 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.17em] text-emerald-200">Founder & Programme Lead</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">Tommy Tse</p>
                </div>
              </div>
            </div>
          </div>

          <div data-about-reveal className="about-v2-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Founder story</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Founded by an engineer who learned that confidence grows through making.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Tommy founded Hardware Learning Lab to make the parts of engineering that can feel intimidating more visible, practical and approachable. His work brings together electronics, sensor systems, PCB design, debugging, teaching and digital product development.
            </p>
            <p className="mt-5 leading-8 text-slate-600">
              He completed a BEng in Electrical and Electronic Engineering at the University of Exeter and is an incoming MSc Sensor Systems Engineering student at Imperial College London. Within the organisation, he leads course design, live delivery, technical development and the web platform.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Education</p>
                <p className="mt-2 font-semibold leading-6 text-slate-900">BEng Electrical & Electronic Engineering</p>
                <p className="mt-1 text-sm text-slate-500">University of Exeter</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">Next chapter</p>
                <p className="mt-2 font-semibold leading-6 text-slate-900">Incoming MSc Sensor Systems Engineering</p>
                <p className="mt-1 text-sm text-slate-500">Imperial College London</p>
              </div>
            </div>

            <a
              href="https://www.linkedin.com/in/tommy-tse-99a906286/"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition duration-300 hover:-translate-y-0.5 hover:border-slate-950"
            >
              View Tommy’s LinkedIn
              <ExternalIcon />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-about-reveal className="about-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">The organisation</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl">
              A small team with complementary responsibilities.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Hardware Learning Lab is being built across engineering, education, customer experience and web development—not around one person doing everything forever.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {team.map((member, index) => (
              <article
                key={member.name}
                data-about-reveal
                className="about-v2-reveal group rounded-[2rem] border border-slate-200 bg-[#f5f5f7] p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(15,23,42,0.12)]"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                {member.image ? (
                  <div className="relative aspect-square overflow-hidden rounded-[1.8rem] bg-slate-200">
                    <Image src={member.image} alt={`${member.name}, ${member.role}`} fill className="object-cover transition duration-700 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 30vw, 90vw" />
                  </div>
                ) : (
                  <TeamPlaceholder initials={member.initials} />
                )}
                <div className="p-4 pb-5 pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{member.role}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{member.name}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{member.description}</p>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-emerald-700">
                      LinkedIn <ExternalIcon />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#070912] py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.12),transparent_34%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div data-about-reveal className="about-v2-reveal">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Long-term learning sectors</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Four directions. One purpose.
              </h2>
            </div>
            <p data-about-reveal className="about-v2-reveal max-w-2xl text-lg leading-8 text-slate-300 lg:justify-self-end">
              Our first school workshop is only the starting point. As the programme grows, we are building toward four connected STEM pathways that link electronics with challenges students can recognise in the world around them.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {sectors.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <article
                  key={sector.title}
                  data-about-reveal
                  className="about-v2-reveal about-v2-sector-card group relative min-h-[32rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.22)]"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <Image src={sector.image} alt={sector.alt} fill className="about-v2-sector-image object-cover" sizes="(min-width: 768px) 48vw, 94vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${sector.accent} opacity-40 mix-blend-screen`} />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-xl">
                        <Icon />
                      </div>
                      <span className="text-sm font-black tracking-[0.15em] text-white/70">{sector.number}</span>
                    </div>
                    <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{sector.title}</h3>
                    <p className="mt-3 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">{sector.text}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div data-about-reveal className="about-v2-reveal mt-8 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-200">Our long view</p>
            <p className="mt-3 max-w-5xl text-2xl font-medium leading-9 text-white sm:text-3xl sm:leading-10">
              A school-ready STEM ecosystem where clear online learning, strong teaching, physical kits, careful AI support and real engineering evidence work together.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="absolute left-1/2 top-0 h-96 w-[54rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-100 via-sky-100 to-indigo-100 blur-3xl" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-[2.5rem] border border-slate-200 bg-white/75 p-7 shadow-[0_30px_100px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:p-14">
            <div data-about-reveal className="about-v2-reveal">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Built for schools</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
                Bring practical STEM into the classroom without asking teachers to build the entire programme alone.
              </h2>
            </div>

            <div data-about-reveal className="about-v2-reveal">
              <p className="text-lg leading-8 text-slate-600">
                We are developing school partnerships that combine a structured platform, live support, teacher-ready resources and hands-on workshops. The aim is a reliable experience for schools and a memorable one for learners.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/schools" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800">
                  Discuss a school pilot
                  <ArrowRightIcon />
                </Link>
                <Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition duration-300 hover:-translate-y-0.5 hover:border-slate-950">
                  See our direction
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
