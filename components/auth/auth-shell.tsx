import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import styles from "./auth-shell.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  sideNote?: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  sideNote,
}: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:px-8">
        <section className={styles.storyPanel}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white">
            <span aria-hidden="true">←</span>
            Hardware Learning Lab
          </Link>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
            {description}
          </p>
          <div className={styles.signalCard}>
            <Image
              src="/images/home/open-guard-learning-flow.svg"
              alt=""
              width={1200}
              height={1000}
              className="h-auto w-full opacity-90"
            />
          </div>
          {sideNote && (
            <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
              {sideNote}
            </p>
          )}
        </section>

        <section className={styles.formPanel}>{children}</section>
      </div>
    </div>
  );
}
