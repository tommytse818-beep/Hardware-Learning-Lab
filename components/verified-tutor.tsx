"use client";

import { FormEvent, useState } from "react";

import type { TutorGuidance } from "@/lib/courses";

type VerifiedTutorProps = {
  lessonTitle: string;
  guidance: TutorGuidance;
};

type GuidanceKey = keyof TutorGuidance;

const quickActions: Array<{ key: GuidanceKey; label: string }> = [
  { key: "hint", label: "Give me a hint" },
  { key: "simpleExplanation", label: "Explain simply" },
  { key: "measurementPrompt", label: "What should I check?" },
];

export function VerifiedTutor({
  lessonTitle,
  guidance,
}: VerifiedTutorProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(
    "Choose a verified prompt or ask a lesson-related question.",
  );

  function chooseGuidance(key: GuidanceKey) {
    setResponse(guidance[key]);
  }

  function answerPrototypeQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = question.toLowerCase();

    if (
      normalized.includes("measure") ||
      normalized.includes("check") ||
      normalized.includes("voltage") ||
      normalized.includes("debug")
    ) {
      setResponse(guidance.measurementPrompt);
    } else if (
      normalized.includes("simple") ||
      normalized.includes("confus") ||
      normalized.includes("understand") ||
      normalized.includes("why")
    ) {
      setResponse(guidance.simpleExplanation);
    } else {
      setResponse(guidance.hint);
    }

    setQuestion("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Verified tutor preview
          </p>
          <h2 className="mt-1 font-semibold text-slate-950">
            Ask about {lessonTitle}
          </h2>
        </div>
        <span
          title="No paid AI API is connected in Stage 1"
          className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600"
        >
          Offline
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        This first version returns human-verified guidance instantly. The live
        AI layer will later paraphrase the same approved material rather than
        grade students independently.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => chooseGuidance(action.key)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div
        aria-live="polite"
        className="mt-4 min-h-28 rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"
      >
        {response}
      </div>

      <form onSubmit={answerPrototypeQuestion} className="mt-4">
        <label
          htmlFor="tutor-question"
          className="text-xs font-semibold text-slate-700"
        >
          Ask a lesson question
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="For example: Why does the switch read LOW?"
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
        <button
          type="submit"
          disabled={question.trim().length === 0}
          className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Ask tutor
        </button>
      </form>
    </section>
  );
}
