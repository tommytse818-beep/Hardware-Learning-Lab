"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const heroFacts = [
  { label: "Ages", value: "14–16" },
  { label: "Length", value: "3 weeks" },
  { label: "Live sessions", value: "6" },
  { label: "Learner hours", value: "11–12" },
];

const packages = [
  {
    name: "Pilot cohort",
    seats: "Up to 12 learners",
    price: "HK$32,000",
    perLearner: "≈ HK$2,670 per learner",
    tag: "Getting started",
    summary:
      "One small group, usually an ECA or a STEM club. The right size for a school testing the programme for the first time.",
    points: [
      "6 pairs at the bench",
      "One instructor throughout",
      "Full kit and manufactured board per learner",
      "Written cohort outcome report",
    ],
    featured: false,
  },
  {
    name: "Class programme",
    seats: "Up to 25 learners",
    price: "HK$52,000",
    perLearner: "≈ HK$2,080 per learner",
    tag: "Most schools",
    summary:
      "One timetabled class. This is the size the course was designed around and the best value per learner for most schools.",
    points: [
      "12–13 pairs at the bench",
      "One instructor plus your subject teacher",
      "Full kit and manufactured board per learner",
      "Teacher account, lesson plans and marking rubric",
    ],
    featured: true,
  },
  {
    name: "Double cohort",
    seats: "Up to 50 learners",
    price: "HK$94,000",
    perLearner: "≈ HK$1,880 per learner",
    tag: "At scale",
    summary:
      "Two classes, or a year-group block. Runs as two parallel groups of 25 so every learner still gets checked at the bench.",
    points: [
      "Two instructors during build and measure weeks",
      "Shared live launch and showcase sessions",
      "Full kit and manufactured board per learner",
      "Combined and per-class outcome reporting",
    ],
    featured: false,
  },
];

const includedEverywhere = [
  {
    title: "Six live sessions",
    text: "Two per week, 50–55 minutes each, delivered in your lab or classroom by our instructor.",
    icon: LiveSessionIcon,
  },
  {
    title: "Recorded course access",
    text: "Around 30 short micro-lessons with checks, hosted on our platform for every learner in the cohort.",
    icon: PlayIcon,
  },
  {
    title: "Hardware kits",
    text: "Reusable low-voltage bench kits, plus the consumable parts each learner keeps in their finished build.",
    icon: KitIcon,
  },
  {
    title: "One manufactured board",
    text: "Every learner who passes the human design review receives a real, centrally manufactured PCB with their project ID.",
    icon: BoardIcon,
  },
  {
    title: "Teacher pack",
    text: "Teacher account, session plans, talk tracks, answer notes, marking rubric and a safety brief.",
    icon: TeacherIcon,
  },
  {
    title: "Evidence and certificates",
    text: "Per-learner progress, measurement records, KiCad evidence and certificates released only after teacher approval.",
    icon: CertificateIcon,
  },
];

const weeks = [
  {
    tag: "Week 1",
    title: "Understand",
    text: "Learners meet the product and the need behind it, then work through circuits, sensing, digital states and logic. They finish with a testable requirement and a truth table.",
    evidence: "Requirement sheet · truth table · LED calculation",
  },
  {
    tag: "Week 2",
    title: "Engineer",
    text: "Timing, Schmitt triggering, transistor drive and real datasheet selection. Learners build the circuit on the bench and compare every prediction against a measured reading.",
    evidence: "Measurement table · working breadboard · fault log",
  },
  {
    tag: "Week 3",
    title: "Design",
    text: "The validated circuit becomes a KiCad schematic and board layout. Learners clear ERC and DRC, then defend their design in a human review before anything is manufactured.",
    evidence: "KiCad source · clean ERC/DRC · spoken explanation",
  },
];

const fundingRoutes = [
  {
    name: "Quality Education Fund",
    short: "QEF",
    status: "Open",
    tone: "open" as const,
    detail:
      "The Dedicated Funding Programme raises the cumulative cap for each publicly-funded school to HK$3 million. QEF Priority Themes also accept applications year-round for one-off, non-profit-making projects.",
    fit: "Best route for a full cohort programme, including hardware and manufactured boards.",
  },
  {
    name: "Life-wide Learning and Sister School Grant",
    short: "LWLSSG",
    status: "Recurrent",
    tone: "open" as const,
    detail:
      "From 2025/26 the EDB consolidated the Life-wide Learning Grant, Sister School Grant and Outdoor Education Camp subsidy. The life-wide learning component is per capita, at HK$1,500 per secondary pupil per school year.",
    fit: "Commonly used for an ECA or STEM-club cohort without a separate application.",
  },
  {
    name: "Composite Information Technology Grant",
    short: "CITG",
    status: "Recurrent",
    tone: "open" as const,
    detail:
      "A recurrent grant schools may deploy flexibly for teaching hardware, software and related support. In 2024/25 rates ran from about HK$275,000 to HK$898,000 depending on school type and class count, and are adjusted annually.",
    fit: "Useful for the reusable bench equipment side of a programme.",
  },
  {
    name: "IT Innovation Lab / Knowing More About IT",
    short: "IT-Lab",
    status: "Concluded",
    tone: "closed" as const,
    detail:
      "Both programmes concluded at the end of the 2025/26 school year. Final applications closed on 30 September 2025 and approved activities had to finish by 31 August 2026.",
    fit: "Do not budget against this route unless a successor programme is announced.",
  },
];

const fundingPack = [
  "Itemised quotation split into delivery, hardware and platform lines",
  "Programme outline mapped to learning outcomes and evidence",
  "Session-by-session schedule you can paste into a proposal",
  "Safety and supervision statement for the practical sessions",
  "Draft success criteria and a plan for measuring them",
];

const resources = [
  {
    title: "Quality Education Fund — funding programmes and application guide",
    source: "qef.org.hk",
    href: "https://www.qef.org.hk/en/application_guide/index.html",
    note: "Start here for the Dedicated Funding Programme and Priority Themes.",
  },
  {
    title: "QEF Guide to Applicants (PDF)",
    source: "qef.org.hk",
    href: "https://www.qef.org.hk/en/application_guide/files/qef_guide_to_applicants2025.pdf",
    note: "What a proposal must contain and how projects are assessed.",
  },
  {
    title: "Life-wide Learning and Sister School Grant",
    source: "edb.gov.hk",
    href: "https://www.edb.gov.hk/en/curriculum-development/curriculum-area/life-wide-learning/LWLSSG/index.html",
    note: "Current scope, rates and the rules on flexible deployment.",
  },
  {
    title: "STEAM education in Hong Kong",
    source: "edb.gov.hk",
    href: "https://www.edb.gov.hk/en/curriculum-development/kla/technology-edu/steam/index.html",
    note: "The policy framing your proposal will be read against.",
  },
  {
    title: "Digital education in primary and secondary schools",
    source: "edb.gov.hk",
    href: "https://www.edb.gov.hk/en/edu-system/primary-secondary/applicable-to-primary-secondary/it-in-edu/index.html",
    note: "Policy documents and ongoing support for digital learning.",
  },
  {
    title: "STEM education in Hong Kong — statistical highlights",
    source: "legco.gov.hk",
    href: "https://app7.legco.gov.hk/rpdb/en/uploads/2026/ISSH/ISSH14_2026_20260424_en.pdf",
    note: "Legislative Council research figures, useful for a needs statement.",
  },
];

const deliveryOptions = [
  {
    title: "Pre-assembled",
    text: "The difficult surface-mount and power sections arrive factory assembled. Learners connect modules, program and measure.",
  },
  {
    title: "Student-soldered",
    text: "Sensitive sections stay assembled while older learners solder the large through-hole parts under supervision.",
  },
  {
    title: "Board keepsake",
    text: "One standard board is personalised through firmware, enclosure, labels and a built-by area, rather than expensive one-off fabrication.",
  },
];

const pilotStandards = [
  {
    figure: "80%",
    label: "of learners complete a working circuit",
    text: "Measured on the bench, not self-reported. If a cohort falls short we change the course before we sell it again.",
  },
  {
    figure: "0",
    label: "founder-dependent lessons",
    text: "A teacher should be able to prepare and run a session from the pack alone, without calling us for every step.",
  },
  {
    figure: "100%",
    label: "human-reviewed manufacture",
    text: "No board is ordered on an automated check. An adult engineer reviews every design before it enters a batch.",
  },
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

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

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="m4.5 10.5 3.4 3.4L15.5 6.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LiveSessionIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="21"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M10 23.5h8M14 19.5v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="14" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PlayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M11.8 10.4 18 14l-6.2 3.6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KitIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <path
        d="M4 10.5h20v12a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 4 22.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 10.5v-2A2.5 2.5 0 0 1 13 6h2a2.5 2.5 0 0 1 2.5 2.5v2M4 15.5h20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoardIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <rect
        x="4.5"
        y="4.5"
        width="19"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 14h4l2-3 2 3h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="14" r="1.6" fill="currentColor" />
      <circle cx="21" cy="14" r="1.6" fill="currentColor" />
      <path d="M14 18.5v3M14 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TeacherIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <path
        d="M14 5 3.5 9.5 14 14l10.5-4.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11.5v6c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M24.5 9.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CertificateIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <circle cx="14" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m10.5 16.5-1.5 7 5-2.5 5 2.5-1.5-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m11.6 11 1.7 1.7 3.1-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinsIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className={className} fill="none">
      <ellipse cx="11" cy="8" rx="7" ry="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4 8v5c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10 16.6c1 2.3 3.9 3.9 7.5 3.9 4.1 0 6.5-1.4 6.5-3.2v-5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse cx="17.5" cy="12.3" rx="6.5" ry="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function SchoolsExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-schools-reveal]"));
    const heroItems = Array.from(root.querySelectorAll<HTMLElement>("[data-schools-hero]"));

    let observer: IntersectionObserver | undefined;
    const heroTimers: number[] = [];

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      // Above-the-fold hero content animates on load. It must never depend on a
      // scroll event, or the primary call to action can sit below the observer's
      // trigger line and stay invisible on a short viewport.
      heroItems.forEach((item, index) => {
        heroTimers.push(
          window.setTimeout(() => item.classList.add("is-visible"), 90 + index * 110),
        );
      });

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
      revealItems
        .filter((item) => !heroItems.includes(item))
        .forEach((item) => observer?.observe(item));
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
        root.style.setProperty("--schools-v2-x", `${((x - 0.5) * 18).toFixed(2)}px`);
        root.style.setProperty("--schools-v2-y", `${((y - 0.5) * 12).toFixed(2)}px`);
        root.style.setProperty("--schools-v2-x-slow", `${((0.5 - x) * 7).toFixed(2)}px`);
        root.style.setProperty("--schools-v2-y-slow", `${((0.5 - y) * 5).toFixed(2)}px`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--schools-v2-x", "0px");
      root.style.setProperty("--schools-v2-y", "0px");
      root.style.setProperty("--schools-v2-x-slow", "0px");
      root.style.setProperty("--schools-v2-y-slow", "0px");
    };

    const updateScroll = () => {
      if (reducedMotion) return;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.6);
        root.style.setProperty("--schools-v2-scroll", `${(progress * 34).toFixed(2)}px`);
        root.style.setProperty("--schools-v2-scroll-slow", `${(-progress * 13).toFixed(2)}px`);
      });
    };

    root.addEventListener("pointermove", updatePointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer);
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      heroTimers.forEach((timer) => window.clearTimeout(timer));
      observer?.disconnect();
      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", updateScroll);
      window.cancelAnimationFrame(pointerFrame);
      window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return (
    <div ref={rootRef} className="schools-v2 overflow-hidden bg-[#f5f5f7] text-slate-950">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="schools-v2-hero relative overflow-hidden bg-[#eef2f7] text-slate-950">
        <div className="schools-v2-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="schools-v2-glow schools-v2-glow-one" />
        <div className="schools-v2-glow schools-v2-glow-two" />

        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
              <div
                data-schools-reveal
                data-schools-hero
                className="schools-v2-reveal inline-flex items-center gap-3 rounded-full border border-blue-900/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.19em] text-blue-800 shadow-sm backdrop-blur-xl"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_18px_rgba(37,99,235,0.75)]" />
                School programmes
              </div>

              <h1
                data-schools-reveal
                data-schools-hero
                className="schools-v2-reveal mt-6 max-w-3xl text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.7rem]"
              >
                Real engineering, inside your timetable.
              </h1>

              <p
                data-schools-reveal
                data-schools-hero
                className="schools-v2-reveal mt-7 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl"
              >
                A three-week practical electronics programme for F4–F5 learners. Six live sessions,
                a full bench build, and a manufactured circuit board every learner can hold up and
                explain.
              </p>

              <div data-schools-reveal data-schools-hero className="schools-v2-reveal mt-9 flex flex-wrap gap-3">
                <Link
                  href="#packages"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  See packages and pricing
                  <ArrowRightIcon />
                </Link>
                <Link
                  href="#funding"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-950/20 bg-white/65 px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-slate-950 hover:bg-white"
                >
                  Funding routes in Hong Kong
                  <ArrowRightIcon />
                </Link>
              </div>
          </div>

          <div data-schools-reveal data-schools-hero className="schools-v2-reveal lg:justify-self-end">
            <div className="schools-v2-hero-media relative w-full max-w-2xl rounded-[2.2rem] border border-white/80 bg-white p-2 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] bg-slate-200">
                <Image
                  src="/images/schools/schools-outcome-context.webp"
                  alt="Connected technology that can inspire a practical school programme"
                  fill
                  priority
                  className="schools-v2-hero-image object-cover object-center"
                  sizes="(min-width: 1024px) 54vw, 94vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 right-5 text-sm font-medium text-white sm:text-base">
                  A structured programme your teachers can see, support and repeat.
                </p>
              </div>
              <div className="schools-v2-hero-facts mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur sm:grid-cols-4 sm:p-3">
                {heroFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl bg-slate-50 px-3 py-3 sm:px-3 sm:py-2.5">
                    <dt className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-500">{fact.label}</dt>
                    <dd className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">{fact.value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* What the school receives                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-schools-reveal className="schools-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              What you receive
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              One package, and nothing left for the teacher to invent.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Schools do not need another set of slides. They need a programme that arrives ready to
              run, with the hardware, the answers and the evidence already prepared.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div
              data-schools-reveal
              className="schools-v2-reveal schools-v2-photo-frame relative overflow-hidden rounded-[2.4rem] bg-slate-950 p-2 shadow-[0_30px_100px_rgba(15,23,42,0.16)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/schools/schools-build-session.webp"
                  alt="A learner building and soldering an electronics project at a workbench"
                  fill
                  className="schools-v2-photo object-cover"
                  sizes="(min-width: 1024px) 46vw, 94vw"
                />
              </div>
            </div>

            <div data-schools-reveal className="schools-v2-reveal grid gap-4 sm:grid-cols-2">
              {includedEverywhere.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-slate-200 bg-[#f5f5f7] p-5 transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                  >
                    <Icon className="h-6 w-6 text-emerald-700" />
                    <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Three weeks                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-32">
        <div className="schools-v2-grid absolute inset-0 opacity-20" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-schools-reveal className="schools-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              How it runs
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl">
              Three weeks. Two live sessions each week.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Learners watch short recorded lessons between sessions, so live time is spent building,
              measuring and being challenged rather than listening.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {weeks.map((week) => (
              <article
                key={week.tag}
                data-schools-reveal
                className="schools-v2-reveal flex flex-col rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] sm:p-7"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                  {week.tag}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {week.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{week.text}</p>
                <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
                  <span className="font-semibold text-slate-200">Evidence produced: </span>
                  {week.evidence}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Packages                                                    */}
      {/* ---------------------------------------------------------- */}
      <section id="packages" className="scroll-mt-20 bg-[#f5f5f7] py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-schools-reveal className="schools-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Packages
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Priced by cohort, because that is how the teaching works.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Practical work happens in pairs, and every learner is checked at the bench. The
              cohort sizes below are the ones we can deliver that promise in.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
            {packages.map((plan) => (
              <article
                key={plan.name}
                data-schools-reveal
                className={`schools-v2-reveal schools-v2-plan flex h-full flex-col rounded-[2rem] p-7 sm:p-8 ${
                  plan.featured
                    ? "schools-v2-plan-featured border-2 border-slate-950 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]"
                    : "border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
                }`}
              >
                <div className="flex h-7 items-center">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] ${
                      plan.featured
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {plan.tag}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{plan.seats}</p>

                <div className="mt-6">
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                    {plan.price}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">{plan.perLearner}</p>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">{plan.summary}</p>

                <ul className="mt-6 flex-1 space-y-3 border-t border-slate-200 pt-6">
                  {plan.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="#contact"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "border border-slate-300 text-slate-900 hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                  }`}
                >
                  Request a quotation
                  <ArrowRightIcon />
                </Link>
              </article>
            ))}
          </div>

          <div
            data-schools-reveal
            className="schools-v2-reveal mt-6 grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-8 lg:grid-cols-[1fr_1fr]"
          >
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-slate-950">
                Cohorts that fall between sizes
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A class of 31 or a group of 40 is common. Rather than force you into the next
                package, additional learners are added to the nearest size at{" "}
                <span className="font-semibold text-slate-950">HK$1,150 per learner</span>, covering
                the kit, the manufactured board, platform access and the certificate.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
                Foundation partner rate
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-950">
                Schools joining the first September 2027 cohorts receive a reduced rate in exchange
                for completion data, teacher feedback and permission to publish an anonymised case
                study. Limited places, agreed in writing before delivery.
              </p>
            </div>
          </div>

          <p
            data-schools-reveal
            className="schools-v2-reveal mt-6 max-w-3xl text-xs leading-6 text-slate-500"
          >
            Prices are indicative for programmes delivered in Hong Kong and are shown so schools can
            budget early. A formal quotation confirms cohort size, dates, delivery mode, travel and
            any customisation before a school commits.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Funding                                                     */}
      {/* ---------------------------------------------------------- */}
      <section
        id="funding"
        className="relative scroll-mt-20 overflow-hidden bg-[#070912] py-24 text-white sm:py-32"
      >
        <div className="schools-v2-grid absolute inset-0 opacity-20" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div data-schools-reveal className="schools-v2-reveal">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                Paying for it
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl">
                Most schools fund this from a grant, not their own reserves.
              </h2>
            </div>
            <p
              data-schools-reveal
              className="schools-v2-reveal text-lg leading-8 text-slate-300 lg:justify-self-end"
            >
              Publicly-funded and DSS schools hold several grants that can cover a practical STEM
              programme. Here are the routes schools use, and one that has now closed.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {fundingRoutes.map((route) => (
              <article
                key={route.short}
                data-schools-reveal
                className={`schools-v2-reveal rounded-[1.8rem] border p-6 backdrop-blur transition duration-300 hover:-translate-y-1 sm:p-7 ${
                  route.tone === "closed"
                    ? "border-white/10 bg-white/[0.03] opacity-80"
                    : "border-white/10 bg-white/[0.055] hover:border-amber-200/30 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] ${
                      route.tone === "closed"
                        ? "bg-slate-700/60 text-slate-300"
                        : "bg-amber-300/15 text-amber-200"
                    }`}
                  >
                    {route.status}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {route.short}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-0.02em] text-white">
                  {route.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{route.detail}</p>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-slate-400">
                  {route.fit}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div
              data-schools-reveal
              className="schools-v2-reveal rounded-[2rem] border border-amber-200/25 bg-amber-300/[0.07] p-7 backdrop-blur sm:p-8"
            >
              <CoinsIcon className="h-7 w-7 text-amber-200" />
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                We write the paperwork with you.
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Ask for the funding pack and we prepare the documents a coordinator needs to put in
                front of a panel head or principal:
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {fundingPack.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-schools-reveal
              className="schools-v2-reveal rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Please read
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                We are a programme provider, not a funding adviser. Grant scopes, caps and deadlines
                change, and eligibility depends on your school type and how the activity is
                classified. Confirm the current position with the EDB, the Quality Education Fund or
                your school supervisor before you build a budget around any route on this page.
              </p>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Positions summarised here reflect published guidance as at August 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Resources                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-schools-reveal className="schools-v2-reveal max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Reading and official sources
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Go to the source before you write a proposal.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              These are the official pages and research documents we point coordinators towards.
              They open in a new tab.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                data-schools-reveal
                className="schools-v2-reveal group flex flex-col rounded-[1.6rem] border border-slate-200 bg-[#f5f5f7] p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {resource.source}
                </span>
                <span className="mt-3 flex-1 text-base font-semibold leading-6 tracking-[-0.01em] text-slate-950">
                  {resource.title}
                </span>
                <span className="mt-3 text-sm leading-6 text-slate-600">{resource.note}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Open source page
                  <ExternalIcon className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Delivery options + standards                                */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-[#f5f5f7] py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div
              data-schools-reveal
              className="schools-v2-reveal schools-v2-photo-frame relative order-2 overflow-hidden rounded-[2.4rem] bg-slate-950 p-2 shadow-[0_30px_100px_rgba(15,23,42,0.14)] lg:order-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/schools/schools-outcome-context.webp"
                  alt="Connected sensors and devices of the kind learners build towards"
                  fill
                  className="schools-v2-photo object-cover"
                  sizes="(min-width: 1024px) 42vw, 94vw"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div data-schools-reveal className="schools-v2-reveal">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Build options
                </p>
                <h2 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  Choose how much your learners assemble.
                </h2>
                <p className="mt-5 text-base leading-7 text-slate-600">
                  The circuit is low-voltage and battery powered throughout. Schools pick the build
                  mode that matches their supervision, equipment and age group.
                </p>
              </div>

              <div className="mt-8 grid gap-4">
                {deliveryOptions.map((option) => (
                  <div
                    key={option.title}
                    data-schools-reveal
                    className="schools-v2-reveal rounded-[1.5rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                  >
                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-slate-950">
                      {option.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{option.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {pilotStandards.map((standard) => (
              <div
                key={standard.label}
                data-schools-reveal
                className="schools-v2-reveal rounded-[1.8rem] border border-slate-200 bg-white p-7"
              >
                <p className="text-5xl font-semibold tracking-[-0.05em] text-slate-950">
                  {standard.figure}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{standard.label}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{standard.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Contact                                                     */}
      {/* ---------------------------------------------------------- */}
      <section
        id="contact"
        className="relative scroll-mt-20 overflow-hidden bg-[#05070c] py-24 text-white sm:py-32"
      >
        <div className="schools-v2-glow schools-v2-glow-one" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div data-schools-reveal className="schools-v2-reveal">
              <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                Start with a conversation, not a contract.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Tell us your year group, roughly how many learners, and the term you are thinking
                about. We will send a quotation, a session schedule and the funding pack, and you can
                take it from there.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
                >
                  See the programme in detail
                  <ArrowRightIcon />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.1]"
                >
                  Who we are
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>

            <div data-schools-reveal className="schools-v2-reveal">
              <div className="schools-v2-float rounded-[2rem] border border-white/15 bg-white/[0.05] p-7 backdrop-blur-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                  What to send us
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    "Year group and approximate cohort size",
                    "Preferred term and lesson slot length",
                    "Whether it is timetabled, an ECA or a STEM club",
                    "Any funding route you are already considering",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                      <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">
                  First cohorts are targeted for September 2027. Earlier conversations help us match
                  dates and instructor availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
