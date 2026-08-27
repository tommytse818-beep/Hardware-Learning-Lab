"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import styles from "./home-experience.module.css";

const journey = [
  {
    number: "01",
    title: "Understand",
    text: "Turn a real user need into an input, a decision and a testable output.",
  },
  {
    number: "02",
    title: "Build",
    text: "Wire the sensor, timing, logic and driver stages as a working low-voltage system.",
  },
  {
    number: "03",
    title: "Measure",
    text: "Use evidence from a meter and structured checks instead of guessing that it works.",
  },
  {
    number: "04",
    title: "Verify",
    text: "Capture the proven circuit in KiCad and prepare it for human review.",
  },
];

const proofPoints = [
  {
    title: "A useful product boundary",
    text: "OpenGuard Mini is an opening alert and reminder—not a lock or a certified security system.",
  },
  {
    title: "Reasoning before answers",
    text: "Hints help learners make the next decision; correct methods appear only after the checkpoint is solved.",
  },
  {
    title: "Evidence that teachers can see",
    text: "Progress comes from calculations, measurements, design checks and reviewed practical work.",
  },
];

const themes = [
  ["Smart living", "Sensors and useful automation for everyday spaces."],
  ["Sustainability", "Measure energy, resources and environmental change."],
  ["Health & movement", "Explore sensing, signals and human-centred devices."],
  ["Space & communications", "Discover telemetry, radio and remote systems."],
];

export function HomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-home-reveal]"),
    );

    let observer: IntersectionObserver | undefined;

    if (reduced) {
      revealItems.forEach((item) => item.classList.add(styles.visible));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add(styles.visible);
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
      );

      revealItems.forEach((item) => observer?.observe(item));
    }

    let pointerFrame = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (reduced || !finePointer) return;
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        const bounds = root.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
        const y = event.clientY / Math.max(window.innerHeight, 1);
        root.style.setProperty("--home-x", `${((x - 0.5) * 12).toFixed(2)}px`);
        root.style.setProperty("--home-y", `${((y - 0.5) * 8).toFixed(2)}px`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--home-x", "0px");
      root.style.setProperty("--home-y", "0px");
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", resetPointer);

    return () => {
      observer?.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", resetPointer);
      window.cancelAnimationFrame(pointerFrame);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.glowOne} aria-hidden="true" />
        <div className={styles.glowTwo} aria-hidden="true" />

        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div className={`${styles.reveal} ${styles.visible}`}>
            <p className={styles.eyebrow}>
              Practical electronics for secondary schools
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">
              Learn electronics.
              <span className="block text-emerald-300">Build something useful.</span>
              <span className="block text-slate-300">Prove that it works.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              OpenGuard Mini is a three-week path from a real user need to
              circuit logic, measurement, testing and a reviewed PCB design.
              Students finish with a product they can explain—not a black box.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/courses/open-guard-mini/preview" className={styles.primaryButton}>
                View the free course preview
              </Link>
              <Link href="/projects/open-guard-mini" className={styles.secondaryButton}>
                Explore OpenGuard Mini
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
              {[
                "F4–F5 · ages 14–16",
                "3 weeks · 6 live sessions",
                "Useful take-home PCB",
              ].map((item) => (
                <span key={item} className={styles.pill}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.productFrame}>
              <Image
                src="/images/home/open-guard-hero-system.svg"
                alt="OpenGuard Mini system illustration showing a door sensor feeding timing, logic, driver, buzzer and LED stages"
                width={1600}
                height={1100}
                priority
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <div className={styles.floatingNote}>
              <span className="text-emerald-300">Product boundary</span>
              <strong>Opening alert, not a lock.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-home-reveal className={styles.reveal}>
            <p className={styles.lightEyebrow}>The learning journey</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              One clear engineering story, from need to evidence.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((item, index) => (
              <article
                key={item.number}
                data-home-reveal
                className={`${styles.reveal} ${styles.journeyCard}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <span className={styles.stepNumber}>{item.number}</span>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070a10] py-20 text-white sm:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:px-8">
          <div data-home-reveal className={styles.reveal}>
            <p className={styles.darkEyebrow}>Current flagship</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              OpenGuard Mini
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A discrete-logic opening alert built around a reed sensor, RC
              timing, Schmitt-trigger clean-up, AND logic and a transistor
              output driver. An ESP32 can be explored later as an extension;
              it is not used to hide the foundation circuit.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              {[
                "Real user need and honest non-goals",
                "Sensor, timing and digital states",
                "Voltage, current and resistance measurement",
                "KiCad schematic and PCB verification",
                "Human-reviewed practical checkpoints",
                "A useful board learners can keep",
              ].map((item) => (
                <li key={item} className={styles.featureRow}>
                  <span aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/projects/open-guard-mini" className={`${styles.primaryButton} mt-9`}>
              See the complete project
            </Link>
          </div>

          <div data-home-reveal className={`${styles.reveal} ${styles.flowFrame}`}>
            <Image
              src="/images/home/open-guard-learning-flow.svg"
              alt="OpenGuard Mini learning flow from user need through circuit building and measurement to PCB review"
              width={1200}
              height={1000}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-home-reveal className={styles.reveal}>
            <p className={styles.lightEyebrow}>Why it feels different</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Designed around learner confidence, not feature count.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {proofPoints.map((item, index) => (
              <article
                key={item.title}
                data-home-reveal
                className={`${styles.reveal} ${styles.proofCard}`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f5f5f7] py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div data-home-reveal className={styles.reveal}>
            <p className={styles.lightEyebrow}>For schools</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Clear preparation. Guided making. Visible evidence.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Students prepare online, build in live sessions and keep a
              structured record of what they calculated, measured and checked.
            </p>
            <Link href="/schools" className={`${styles.darkButton} mt-8`}>
              Explore the school programme
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Short pre-recorded concept lessons",
              "Six teacher-led practical sessions",
              "Individual school-issued accounts",
              "Teacher-visible checkpoint progress",
            ].map((item, index) => (
              <div
                key={item}
                data-home-reveal
                className={`${styles.reveal} ${styles.schoolCard}`}
                style={{ transitionDelay: `${index * 55}ms` }}
              >
                <span className={styles.miniIndex}>0{index + 1}</span>
                <p className="mt-8 text-lg font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-home-reveal className={styles.reveal}>
            <p className={styles.lightEyebrow}>Future project families</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              One practical method, many ways to shape the world.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              OpenGuard Mini is available first. The themes below are future
              directions, not products currently for sale.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {themes.map(([title, text], index) => (
              <article
                key={title}
                data-home-reveal
                className={`${styles.reveal} ${styles.themeCard}`}
                style={{ transitionDelay: `${index * 55}ms` }}
              >
                <span className={styles.themeDot} aria-hidden="true" />
                <h3 className="mt-12 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                <span className="mt-7 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Future direction
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#05070c] py-20 text-white sm:py-28">
        <div className={styles.finalGlow} aria-hidden="true" />
        <div data-home-reveal className={`${styles.reveal} relative mx-auto max-w-5xl px-4 text-center sm:px-6`}>
          <p className={styles.darkEyebrow}>The next step</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
            Help students see technology as something they can shape.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/courses/open-guard-mini/preview" className={styles.primaryButton}>
              Open the free preview
            </Link>
            <Link href="/schools" className={styles.secondaryButton}>
              Talk about a school pilot
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
