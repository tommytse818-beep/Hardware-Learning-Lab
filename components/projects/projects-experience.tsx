"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { OpenGuardSystemAnimation } from "@/components/projects/open-guard-system-animation";

type Status = "Working" | "Upcoming" | "Planned";

type Theme = {
  id: string;
  number: string;
  title: string;
  status: Status;
  image: string;
  imageAlt: string;
  summary: string;
  project: {
    title: string;
    eyebrow: string;
    description: string;
    learning: string[];
    href?: string;
    visual: "video" | "image";
  };
  icon: (props: { className?: string }) => ReactNode;
};

const themes: Theme[] = [
  {
    id: "smart-living",
    number: "01",
    title: "Smart living",
    status: "Working",
    image: "/images/projects/sectors/smart-living.webp",
    imageAlt: "Smart-home technology and connected devices",
    summary:
      "Use sensors, logic and practical hardware to make everyday spaces more useful and understandable.",
    project: {
      title: "OpenGuard Mini",
      eyebrow: "First school workshop",
      description:
        "A removable door, locker or drawer opening alert and privacy reminder. It is a real low-voltage product, not a mechanical lock or certified security system.",
      learning: [
        "Input, process and output",
        "Circuit safety and measurement",
        "Sensors, pull resistors and logic",
        "Breadboard evidence and KiCad later",
      ],
      href: "/projects/open-guard-mini",
      visual: "video",
    },
    icon: HomeCircuitIcon,
  },
  {
    id: "sustainability-climate",
    number: "02",
    title: "Sustainability & climate",
    status: "Planned",
    image: "/images/projects/sectors/sustainability-climate.webp",
    imageAlt: "Environmental sensor used for weather and climate monitoring",
    summary:
      "Measure energy and environmental conditions, then turn data into an evidence-led design decision.",
    project: {
      title: "Climate Sense Station",
      eyebrow: "Concept direction",
      description:
        "A future sensing project exploring temperature, humidity, light and energy awareness through calibration and data interpretation.",
      learning: [
        "Environmental sensing",
        "Calibration and uncertainty",
        "Energy-aware design",
        "Data logging and explanation",
      ],
      visual: "image",
    },
    icon: ClimateLeafIcon,
  },
  {
    id: "health-movement",
    number: "03",
    title: "Health & movement",
    status: "Upcoming",
    image: "/images/projects/sectors/health-movement.webp",
    imageAlt: "Wearable movement sensor used during physical activity",
    summary:
      "Connect electronics with the human body through safe, carefully scoped movement and wearable-sensor projects.",
    project: {
      title: "Movement & Grip Lab",
      eyebrow: "Future development",
      description:
        "A future pathway introducing force, movement and wearable sensing while keeping health claims and human-subject work within a responsible boundary.",
      learning: [
        "Sensor signals",
        "Sampling and filtering",
        "Movement evidence",
        "Responsible interpretation",
      ],
      visual: "image",
    },
    icon: HealthPulseIcon,
  },
  {
    id: "space-communications",
    number: "04",
    title: "Space & communications",
    status: "Planned",
    image: "/images/projects/sectors/space-communications.webp",
    imageAlt: "Radio telescope used for communication and space observation",
    summary:
      "Reveal how signals travel across distance through radio, telemetry, addressing and error-aware communication.",
    project: {
      title: "Signal & Telemetry Explorer",
      eyebrow: "Longer-term direction",
      description:
        "A future communication project in which students encode a sensor reading, transmit it and verify that the received information remains meaningful.",
      learning: [
        "Signals and modulation",
        "Packets and addressing",
        "Telemetry integrity",
        "Remote sensing",
      ],
      visual: "image",
    },
    icon: SatelliteIcon,
  },
];

const statusClasses: Record<Status, string> = {
  Working:
    "border-emerald-300/60 bg-emerald-400/15 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.18)]",
  Upcoming:
    "border-amber-300/60 bg-amber-300/15 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.14)]",
  Planned:
    "border-rose-300/50 bg-rose-400/[0.12] text-rose-100 shadow-[0_0_28px_rgba(251,113,133,0.12)]",
};

function TiltSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 5;
    const rotateX = (0.5 - y) * 5;

    element.style.setProperty("--project-tilt-x", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--project-tilt-y", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--project-light-x", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--project-light-y", `${(y * 100).toFixed(1)}%`);
  }

  function reset(event: ReactPointerEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    element.style.setProperty("--project-tilt-x", "0deg");
    element.style.setProperty("--project-tilt-y", "0deg");
    element.style.setProperty("--project-light-x", "50%");
    element.style.setProperty("--project-light-y", "50%");
  }

  return (
    <div
      onPointerMove={move}
      onPointerLeave={reset}
      className={`projects-v1-tilt ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function ProjectsExperience() {
  const [activeId, setActiveId] = useState(themes[0].id);
  const rootRef = useRef<HTMLElement>(null);
  const activeTheme = themes.find((theme) => theme.id === activeId) ?? themes[0];
  const ActiveIcon = activeTheme.icon;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const element = root;
    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>(".projects-v1-reveal"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    revealItems.forEach((item) => observer.observe(item));

    function handlePointer(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.18;
      element.style.setProperty("--projects-v1-x", `${x * 18}px`);
      element.style.setProperty("--projects-v1-y", `${y * 14}px`);
      element.style.setProperty("--projects-v1-x-slow", `${x * 8}px`);
      element.style.setProperty("--projects-v1-y-slow", `${y * 6}px`);
    }

    element.addEventListener("pointermove", handlePointer);
    return () => {
      element.removeEventListener("pointermove", handlePointer);
      observer.disconnect();
    };
  }, []);

  return (
    <main ref={rootRef} className="projects-v1 overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate min-h-[78vh] overflow-hidden border-b border-white/10">
        <div className="projects-v1-grid absolute inset-0 opacity-80" />
        <div className="projects-v1-glow projects-v1-glow-one" />
        <div className="projects-v1-glow projects-v1-glow-two" />
        <div className="projects-v1-parallax absolute right-[-8rem] top-14 h-[29rem] w-[29rem] rounded-full border border-cyan-300/20" />
        <div className="projects-v1-parallax-slow absolute bottom-[-12rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full border border-violet-300/15" />

        <div className="relative mx-auto grid min-h-[78vh] w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="projects-v1-reveal max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Hardware Learning Lab projects
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              One useful product.
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                A whole world of electronics.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Each programme begins with something a learner can understand and
              use, then uncovers the sensing, logic, measurement and design
              decisions inside it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects/open-guard-mini"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.025] hover:bg-emerald-100"
              >
                Explore the first workshop
                <ArrowIcon />
              </Link>
              <Link
                href="/schools"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                For schools
              </Link>
            </div>
          </div>

          <TiltSurface className="projects-v1-reveal projects-v1-hero-card relative">
            <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-br from-emerald-300/20 via-cyan-300/5 to-violet-300/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/15 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl">
              <OpenGuardSystemAnimation className="aspect-video w-full rounded-[1.8rem] object-cover" />
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Smart living • First project
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    OpenGuard Mini
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    Door state becomes a defined signal, then a timed logic
                    decision and a visible and audible response.
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusClasses.Working}`}>
                  Working
                </span>
              </div>
            </div>
          </TiltSurface>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="projects-v1-reveal max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Four long-term sectors
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Choose the world you want to help shape.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Smart living is the active development track. The other sectors are
            shown honestly as upcoming or planned directions rather than
            finished courses.
          </p>
        </div>

        <div className="projects-v1-reveal mt-10 grid gap-3 lg:grid-cols-4" role="tablist" aria-label="Project sectors">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const active = theme.id === activeId;
            return (
              <button
                key={theme.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="project-theme-panel"
                onClick={() => setActiveId(theme.id)}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${
                  active
                    ? "border-white/30 bg-white/[0.11] shadow-xl"
                    : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-white text-slate-950" : "bg-white/10 text-white"}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider ${statusClasses[theme.status]}`}>
                    {theme.status}
                  </span>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.17em] text-slate-500">
                  {theme.number}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {theme.title}
                </h3>
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 transition-all duration-500 ${active ? "w-full" : "w-0 group-hover:w-1/2"}`} />
              </button>
            );
          })}
        </div>

        <div
          id="project-theme-panel"
          role="tabpanel"
          className="projects-v1-panel-enter mt-6"
          key={activeTheme.id}
        >
          <TiltSurface className="grid overflow-hidden rounded-[2.2rem] border border-white/[0.12] bg-white/[0.055] shadow-2xl lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[23rem] overflow-hidden">
              {activeTheme.project.visual === "video" ? (
                <OpenGuardSystemAnimation className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.035]" />
              ) : (
                <Image
                  src={activeTheme.image}
                  alt={activeTheme.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition duration-700 hover:scale-[1.045]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4">
                <span className="rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur">
                  {activeTheme.project.eyebrow}
                </span>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusClasses[activeTheme.status]}`}>
                  {activeTheme.status}
                </span>
              </div>
            </div>

            <div className="relative p-7 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
                  <ActiveIcon className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {activeTheme.number} / 04
                </span>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.19em] text-emerald-300">
                {activeTheme.title}
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                {activeTheme.project.title}
              </h3>
              <p className="mt-5 text-base leading-7 text-slate-300">
                {activeTheme.project.description}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {activeTheme.summary}
              </p>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {activeTheme.project.learning.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-200"
                  >
                    <span className="mr-2 text-emerald-300">●</span>
                    {item}
                  </div>
                ))}
              </div>

              {activeTheme.project.href ? (
                <Link
                  href={activeTheme.project.href}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.025] hover:bg-emerald-200"
                >
                  Open project experience
                  <ArrowIcon />
                </Link>
              ) : (
                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
                  This is a transparent roadmap concept, not a purchasable or
                  completed course yet.
                </div>
              )}
            </div>
          </TiltSurface>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="projects-v1-reveal mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Built for school delivery
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Begin with the public preview. Unlock the learning journey through your school.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">
              The project demonstration remains public. The structured lessons,
              evidence, practical support and later KiCad work require an active
              learner seat and sign-in.
            </p>
          </div>
          <Link
            href="/projects/open-guard-mini"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-emerald-100"
          >
            See OpenGuard Mini
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function HomeCircuitIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path d="M5 14.5 16 5l11 9.5V27H9V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 27v-8h8v8M7 11h4V7h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="11" r="1.8" fill="currentColor" />
      <circle cx="15" cy="7" r="1.8" fill="currentColor" />
    </svg>
  );
}

function ClimateLeafIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path d="M25.5 6.5C16 7 8.5 11.2 8.5 19.2c0 4.2 3 7.3 7.3 7.3 8 0 10.1-8.8 9.7-20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 27c4-7.6 9.1-11.2 15.5-14.3M17 18c.3 2.4 1.2 4.2 2.8 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HealthPulseIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path d="M16 27.2S5.5 21 5.5 12.8A6.2 6.2 0 0 1 16 8.3a6.2 6.2 0 0 1 10.5 4.5C26.5 21 16 27.2 16 27.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 16h6l2.1-4 3.2 8 2.5-5H28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SatelliteIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="none">
      <path d="M9.2 20.5a9.5 9.5 0 0 0 12.6-12.6L9.2 20.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m17.2 12.6 2.2 2.2M13.5 19.1l-4.8 4.8M6 26.6l2.7-2.7 2.7 2.7M22.4 6.2c2.1.5 3.9 2.3 4.4 4.4M23.2 2.7c3.8.8 6.3 3.3 7.1 7.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
