"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { OpenGuardSystemAnimation } from "@/components/projects/open-guard-system-animation";
import type { CourseAccessResult } from "@/lib/course-access";

type LessonSummary = {
  slug: string;
  section: string;
  title: string;
  duration: string;
  delivery: string;
  summary: string;
};

type OpenGuardProjectExperienceProps = {
  access: CourseAccessResult;
  signedIn: boolean;
  courseSlug: string;
  lessons: LessonSummary[];
};

const foundationConcepts = [
  "Input, process and output",
  "Extra-low-voltage safety",
  "Voltage, current and resistance",
  "Ohm's law and LED current",
  "Reed sensors and physical state",
  "Pull-up and pull-down resistors",
  "AND, OR and NOT logic",
  "Boolean requirements and truth tables",
];

const deliverySteps = [
  {
    number: "0",
    title: "Induct",
    text: "A 1.5-2 hour live or school-approved recorded induction explains the programme, safety, evidence and practical schedule.",
  },
  {
    number: "1",
    title: "Learn",
    text: "Short pre-recorded lessons 1.1-1.8 each teach one idea, pause for a question and reveal the method only after a correct attempt.",
  },
  {
    number: "1.9",
    title: "Defend",
    text: "A live design checkpoint checks the complete Week 1 reasoning before timing, breadboard and KiCad work continue.",
  },
];

export function OpenGuardProjectExperience({
  access,
  signedIn,
  courseSlug,
  lessons,
}: OpenGuardProjectExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionOneLessons = lessons.filter((lesson) => lesson.section !== "0");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const element = root;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(".project-detail-v1-reveal"),
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
      { threshold: 0.13 },
    );
    items.forEach((item) => observer.observe(item));

    function pointerMove(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.15;
      element.style.setProperty("--project-detail-x", `${x * 18}px`);
      element.style.setProperty("--project-detail-y", `${y * 12}px`);
      element.style.setProperty("--project-detail-x-slow", `${x * 7}px`);
      element.style.setProperty("--project-detail-y-slow", `${y * 5}px`);
    }

    element.addEventListener("pointermove", pointerMove);
    return () => {
      element.removeEventListener("pointermove", pointerMove);
      observer.disconnect();
    };
  }, []);

  const courseHref = `/courses/${courseSlug}`;
  const loginHref = `/login?next=${encodeURIComponent(courseHref)}`;

  return (
    <div ref={rootRef} className="project-detail-v1 overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate min-h-[86vh] overflow-hidden border-b border-white/10">
        <div className="project-detail-v1-grid absolute inset-0" />
        <div className="project-detail-v1-orb project-detail-v1-orb-one" />
        <div className="project-detail-v1-orb project-detail-v1-orb-two" />

        <div className="relative mx-auto grid min-h-[86vh] w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div className="project-detail-v1-reveal">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              All projects
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-300/50 bg-emerald-300/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Smart living
              </span>
              <span className="rounded-full border border-emerald-300/50 bg-emerald-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Working
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                First workshop
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              OpenGuard Mini
            </h1>
            <p className="mt-4 text-2xl font-medium tracking-[-0.025em] text-emerald-200 sm:text-3xl">
              A removable door, locker or drawer alert.
            </p>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              Learners begin with a useful everyday need, then uncover the
              electronic system inside it: sensing, defined states, logic,
              measurement, evidence and later PCB design.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#preview"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.025] hover:bg-emerald-100"
              >
                Watch the public preview
                <ArrowIcon />
              </a>
              {access.allowed ? (
                <Link
                  href={courseHref}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.025] hover:bg-emerald-200"
                >
                  Open the learning pathway
                  <ArrowIcon />
                </Link>
              ) : signedIn ? (
                <Link
                  href="/schools"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask your school for access
                </Link>
              ) : (
                <Link
                  href={loginHref}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in for course access
                </Link>
              )}
            </div>
          </div>

          <div className="project-detail-v1-reveal project-detail-v1-parallax relative">
            <div className="absolute inset-[-1.5rem] rounded-[3rem] bg-gradient-to-br from-emerald-300/20 via-cyan-300/5 to-violet-300/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.3rem] border border-white/15 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl">
              <OpenGuardSystemAnimation className="aspect-video w-full rounded-[1.95rem] object-cover" />
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-200">
                    4-second concept system preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Door opens → sensor changes → timing and logic decide →
                    LED and buzzer respond.
                  </p>
                </div>
                <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                  Concept animation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="project-detail-v1-reveal grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.21em] text-emerald-300">
              0. Public project preview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              See the result before seeing the circuit.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              This public preview remains available without purchase. It shows
              the intended use and the high-level electronic journey, but it
              deliberately does not reveal every assessed answer or final
              component value.
            </p>
            <div className="mt-7 space-y-3">
              {[
                "Attach only with approved removable mounting and permission.",
                "Use it as an opening alert or reminder, not a physical lock.",
                "The foundation project is battery-powered extra-low voltage.",
                "The final circuit, PCB and batch still require adult validation.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-200">
                  <span className="mt-1 text-emerald-300">●</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="project-detail-v1-magnify overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.05] p-2 shadow-2xl">
            <OpenGuardSystemAnimation variant="public" controls className="aspect-video w-full rounded-[1.7rem] object-cover" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035]">
        <div className="project-detail-v1-reveal mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-2">
            <Image
              src="/images/projects/open-guard-mini/open-guard-product-concept.webp"
              alt="OpenGuard Mini removable door, locker or drawer alert concept"
              width={1995}
              height={1175}
              className="h-auto w-full rounded-[1.7rem] object-contain bg-white"
            />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              Concept visual — not a manufacturing photograph
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              What the first workshop is really teaching
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              Not just how to assemble it. Why it works.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The product gives the learning a purpose. Students investigate
              the system, calculate instead of guessing, define digital states,
              prove logic and later compare predictions with physical evidence.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {foundationConcepts.map((concept, index) => (
                <div key={concept} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold text-emerald-300">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{concept}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="project-detail-v1-reveal max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
            School delivery model
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Induct. Learn. Build. Explain.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The online content supports the practical workshop; it does not
            replace teacher contact, hands-on work or human approval.
          </p>
        </div>
        <div className="project-detail-v1-reveal mt-10 grid gap-4 lg:grid-cols-3">
          {deliverySteps.map((step) => (
            <div key={step.number} className="project-detail-v1-magnify rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6">
              <p className="text-4xl font-semibold tracking-[-0.04em] text-emerald-300">{step.number}</p>
              <h3 className="mt-5 text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="project-detail-v1-reveal flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Section 1 now being built
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                From 1.1 to the Week 1 design checkpoint.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-300">
              Each pre-recorded lesson teaches one idea, pauses for a question
              and reveals the method only after the learner reaches the correct
              answer. Section 1.9 remains a human-led checkpoint.
            </p>
          </div>

          <div className="project-detail-v1-reveal mt-10 grid gap-4 lg:grid-cols-3">
            {sectionOneLessons.map((lesson) => (
              <article key={lesson.slug} className="project-detail-v1-magnify rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-11 min-w-11 place-items-center rounded-xl bg-white text-sm font-bold text-slate-950">
                    {lesson.section}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{lesson.duration}</span>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
                  {lesson.delivery}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{lesson.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{lesson.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="project-detail-v1-reveal grid overflow-hidden rounded-[2.2rem] border border-white/[0.12] bg-gradient-to-br from-emerald-400/15 via-cyan-400/5 to-violet-400/10 lg:grid-cols-[1fr_0.75fr]">
          <div className="p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              Course access
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Public preview outside. Structured learning inside.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              {access.message}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {access.allowed ? (
                <Link href={courseHref} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.025] hover:bg-emerald-100">
                  Enter Section 0
                  <ArrowIcon />
                </Link>
              ) : signedIn ? (
                <Link href="/schools" className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">
                  Ask your teacher or school
                </Link>
              ) : (
                <Link href={loginHref} className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">
                  Sign in
                </Link>
              )}
              <Link href="/schools" className="inline-flex rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                School partnership information
              </Link>
            </div>
          </div>
          <div className="relative min-h-[20rem]">
            <Image
              src="/images/projects/open-guard-mini/open-guard-system-map.webp"
              alt="OpenGuard Mini system map"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-contain bg-white p-6"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
