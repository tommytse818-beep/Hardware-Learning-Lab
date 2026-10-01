"use client";

import { useState } from "react";

type CheckView =
  | { id: string; kind: "choice"; prompt: string; options: string[] }
  | { id: string; kind: "numeric"; prompt: string; unit: string };

export function LessonFormativeCheck({ courseSlug, lessonSlug, check }: { courseSlug: string; lessonSlug: string; check: CheckView }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState("");
  const [result, setResult] = useState<{ correct: boolean; feedback: string; hint?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const hasAnswer = check.kind === "choice" ? selectedIndex !== null : numericValue.trim() !== "";

  async function submit() {
    if (!hasAnswer || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/formative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug, questionId: check.id, ...(check.kind === "choice" ? { selectedIndex } : { numericValue }) }),
      });
      const payload = await response.json() as { correct?: boolean; feedback?: string; hint?: string; error?: string };
      if (!response.ok || typeof payload.correct !== "boolean" || !payload.feedback) throw new Error(payload.error ?? "This practice answer could not be checked.");
      setResult({ correct: payload.correct, feedback: payload.feedback, hint: payload.hint });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This practice answer could not be checked.");
    } finally {
      setPending(false);
    }
  }

  return <section className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-5">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Practice only · does not change completion</p>
    <h3 className="mt-2 text-lg font-semibold text-slate-950">{check.prompt}</h3>
    {check.kind === "choice" ? <fieldset className="mt-4 grid gap-2 sm:grid-cols-2">
      <legend className="sr-only">Choose one answer</legend>
      {check.options.map((option, index) => <label key={option} className="flex cursor-pointer gap-3 rounded-xl border border-teal-200 bg-white p-3 text-sm leading-6">
        <input type="radio" name={check.id} checked={selectedIndex === index} onChange={() => { setSelectedIndex(index); setResult(null); }} />
        <span>{option}</span>
      </label>)}
    </fieldset> : <label className="mt-4 block text-sm font-semibold text-slate-700">Answer in {check.unit}
      <input value={numericValue} onChange={(event) => { setNumericValue(event.target.value); setResult(null); }} inputMode="decimal" className="mt-2 block w-full rounded-xl border border-teal-300 bg-white px-4 py-3 font-normal" />
    </label>}
    <button type="button" onClick={submit} disabled={!hasAnswer || pending} className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300">{pending ? "Checking…" : "Check practice"}</button>
    {error && <p role="alert" className="mt-3 text-sm text-rose-800">{error}</p>}
    {result && <div aria-live="polite" className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${result.correct ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-amber-50 text-amber-950"}`}><strong>{result.correct ? "Correct." : "Not yet."}</strong> {result.feedback}{!result.correct && result.hint && <p className="mt-2"><strong>Next step:</strong> {result.hint}</p>}</div>}
  </section>;
}