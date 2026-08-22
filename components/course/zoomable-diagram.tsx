"use client";

import Image from "next/image";
import { useState, type PointerEvent as ReactPointerEvent } from "react";

import type { LessonDiagram } from "@/lib/courses";

type ZoomableDiagramProps = {
  diagram: LessonDiagram;
};

export function ZoomableDiagram({ diagram }: ZoomableDiagramProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  function trackPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  return (
    <figure className="lesson-v1-diagram overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
            Correct-scale lesson diagram
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Original aspect ratio {diagram.width}:{diagram.height}; no stretching or square crop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setZoomed((current: boolean) => !current)}
          aria-pressed={zoomed}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          {zoomed ? "Fit diagram" : "Magnify diagram"}
        </button>
      </div>

      <div
        onPointerMove={trackPointer}
        onPointerLeave={() => setOrigin({ x: 50, y: 50 })}
        className={`lesson-v1-diagram-stage ${zoomed ? "is-zoomed" : ""}`}
      >
        <Image
          src={diagram.src}
          alt={diagram.alt}
          width={diagram.width}
          height={diagram.height}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="lesson-v1-diagram-image h-auto max-w-full object-contain"
          style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
          priority={false}
        />
      </div>

      <figcaption className="border-t border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600 sm:px-5">
        {diagram.caption}
      </figcaption>
    </figure>
  );
}
