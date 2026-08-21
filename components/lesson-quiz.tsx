"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LessonQuizProps = {
  courseSlug: string;
  lessonSlug: string;
  question: string;
  options: string[];
  initialCompleted: boolean;
  initialScore: number | null;
  cloudConnected: boolean;
};

type QuizResult = {
  correct: boolean;
  score: number;
  explanation: string;
  saved: boolean;
  saveMessage?: string;
};

export function LessonQuiz({
  courseSlug,
  lessonSlug,
  question,
  options,
  initialCompleted,
  initialScore,
  cloudConnected,
}: LessonQuizProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(
    initialCompleted
      ? {
          correct: true,
          score: initialScore ?? 100,
          explanation:
            "You have already completed this checkpoint. You may attempt it again for revision.",
          saved: cloudConnected,
          saveMessage: cloudConnected
            ? undefined
            : "Demo mode: this is browser-only progress, not a school or cloud record.",
        }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  async function submitAnswer() {
    if (selectedIndex === null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          selectedIndex,
        }),
      });

      const data = (await response.json()) as QuizResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "The answer could not be checked.");
      }

      setResult(data);
      router.refresh();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "The answer could not be checked.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
        Knowledge checkpoint
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {question}
      </h2>

      <fieldset className="mt-5 space-y-3">
        <legend className="sr-only">Choose one answer</legend>
        {options.map((option, index) => {
          const selected = selectedIndex === index;

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                selected
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="lesson-answer"
                value={index}
                checked={selected}
                onChange={() => {
                  setSelectedIndex(index);
                  setResult(null);
                }}
                className="mt-0.5 h-4 w-4 accent-indigo-600"
              />
              <span className="leading-6 text-slate-800">{option}</span>
            </label>
          );
        })}
      </fieldset>

      <button
        type="button"
        onClick={submitAnswer}
        disabled={selectedIndex === null || isSubmitting}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? "Checking…" : "Check answer"}
      </button>

      {requestError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {requestError}
        </p>
      )}

      {result && (
        <div
          aria-live="polite"
          className={`mt-5 rounded-xl border p-4 ${
            result.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="font-semibold">
            {result.correct
              ? `Correct — ${result.score}%`
              : "Not yet — review the explanation and try again."}
          </p>
          <p className="mt-2 text-sm leading-6">{result.explanation}</p>
          {!result.saved && (
            <p className="mt-2 text-xs font-medium">
              {result.saveMessage ??
                "Prototype mode: this result is stored only in this browser until Supabase is connected."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
