"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

type ChoiceQuizView = {
  kind: "choice";
  question: string;
  options: string[];
};

type NumericQuizView = {
  kind: "numeric";
  question: string;
  unit: string;
  placeholder: string;
};

type QuizView = ChoiceQuizView | NumericQuizView;

type LessonQuizProps = {
  courseSlug: string;
  lessonSlug: string;
  quiz: QuizView;
  questionId?: string;
  initialCompleted: boolean;
  initialScore: number | null;
  initialMethod?: string[];
  initialExplanation?: string;
  cloudConnected: boolean;
  nextHref: string;
  nextLabel: string;
  humanReviewRequired?: boolean;
  reviewState?: string;
  reviewFeedback?: string | null;
};

type MicroCheckDefinition = {
  id: string;
  question: string;
  options: string[];
  hint: string;
  incorrectFeedback?: string;
  method: string[];
  explanation: string;
};

type QuizResult = {
  correct: boolean;
  score: number;
  feedback: string;
  hint?: string;
  method?: string[];
  explanation?: string;
  saved: boolean;
  saveMessage?: string;
  completed?: boolean;
  onlineReady?: boolean;
  quizScore?: number;
  solvedQuestionIds?: string[];
};

export function LessonMicroCheckGroup({
  courseSlug,
  lessonSlug,
  checks,
  nextHref,
  nextLabel,
  cloudConnected,
  initialSolvedQuestions = [],
}: {
  courseSlug: string;
  lessonSlug: string;
  checks: MicroCheckDefinition[];
  nextHref: string;
  nextLabel: string;
  cloudConnected: boolean;
  initialSolvedQuestions?: Array<{ questionId: string; score: number }>;
}) {
  const router = useRouter();
  const initialSolved = Object.fromEntries(
    initialSolvedQuestions.map((question) => {
      const check = checks.find((item) => item.id === question.questionId);
      return [
        question.questionId,
        {
          correct: true,
          score: question.score,
          feedback:
            "This micro-check is already complete. You can review the method or submit another attempt.",
          method: check?.method,
          explanation: check?.explanation,
          saved: cloudConnected,
        } satisfies QuizResult,
      ];
    }),
  );
  const [selectedIndexById, setSelectedIndexById] = useState<Record<string, number | null>>({});
  const [resultById, setResultById] = useState<Record<string, QuizResult | null>>(initialSolved);
  const [requestErrorById, setRequestErrorById] = useState<Record<string, string>>({});
  const [submittingById, setSubmittingById] = useState<Record<string, boolean>>({});

  const allCorrect =
    checks.length > 0 &&
    checks.every((check) => resultById[check.id]?.correct === true);

  async function submitCheck(check: MicroCheckDefinition) {
    const selectedIndex = selectedIndexById[check.id];

    if (selectedIndex === null || selectedIndex === undefined) {
      return;
    }

    setSubmittingById((previous) => ({ ...previous, [check.id]: true }));
    setRequestErrorById((previous) => ({ ...previous, [check.id]: "" }));

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug,
          lessonSlug,
          questionId: check.id,
          selectedIndex,
        }),
      });

      const data = (await response.json()) as QuizResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "The answer could not be checked.");
      }

      setResultById((previous) => ({ ...previous, [check.id]: data }));
      if (data.completed || data.onlineReady) {
        router.refresh();
      }
    } catch (error) {
      setRequestErrorById((previous) => ({
        ...previous,
        [check.id]:
          error instanceof Error
            ? error.message
            : "The answer could not be checked.",
      }));
    } finally {
      setSubmittingById((previous) => ({ ...previous, [check.id]: false }));
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Micro-checks
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Complete all three correctly to unlock the next lesson.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {checks.length} required questions
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {checks.map((check, index) => {
          const selectedIndex = selectedIndexById[check.id] ?? null;
          const result = resultById[check.id] ?? null;
          const requestError = requestErrorById[check.id] ?? "";
          const isSubmitting = submittingById[check.id] ?? false;
          const letterBase = String.fromCharCode(65);

          return (
            <div
              key={check.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
            >
              <p className="text-sm font-semibold text-slate-700">
                Question {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                {check.question}
              </h3>

              <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Choose one answer</legend>
                {check.options.map((option, optionIndex) => {
                  const selected = selectedIndex === optionIndex;
                  const letter = String.fromCharCode(letterBase.charCodeAt(0) + optionIndex);

                  return (
                    <label
                      key={`${check.id}-${option}`}
                      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 shadow-sm"
                          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`lesson-answer-${check.id}`}
                        value={optionIndex}
                        checked={selected}
                        onChange={() => {
                          setSelectedIndexById((previous) => ({
                            ...previous,
                            [check.id]: optionIndex,
                          }));
                          setRequestErrorById((previous) => ({ ...previous, [check.id]: "" }));
                          setResultById((previous) => ({ ...previous, [check.id]: null }));
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="pt-1 leading-6 text-slate-800">{option}</span>
                    </label>
                  );
                })}
              </fieldset>

              <button
                type="button"
                onClick={() => submitCheck(check)}
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
                  className={`mt-5 overflow-hidden rounded-2xl border ${
                    result.correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                  }`}
                >
                  <div className="p-5">
                    <p className="font-semibold">
                      {result.correct
                        ? `Correct — ${result.score}%`
                        : "Not yet — use the hint and try again."}
                    </p>
                    <p className="mt-2 text-sm leading-6">{result.feedback}</p>

                    {!result.correct && result.hint && (
                      <div className="mt-4 rounded-xl border border-amber-300/70 bg-white/65 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                          Smallest useful hint
                        </p>
                        <p className="mt-2 text-sm leading-6">{result.hint}</p>
                      </div>
                    )}

                    {result.correct && result.method && result.method.length > 0 && (
                      <div className="mt-5 rounded-xl border border-emerald-200 bg-white/75 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                          Method revealed
                        </p>
                        <ol className="mt-3 space-y-3 text-sm leading-6">
                          {result.method.map((step: string, methodIndex: number) => (
                            <li key={`${check.id}-${step}`} className="flex gap-3">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                {methodIndex + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {result.correct && result.explanation && (
                      <div className="mt-4 text-sm leading-6">
                        <strong>Why this is correct:</strong> {result.explanation}
                      </div>
                    )}

                    {!result.saved && (
                      <p className="mt-3 text-xs font-medium">
                        {result.saveMessage ??
                          "Prototype mode: this result is stored only in this browser until Supabase is connected."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allCorrect && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm font-semibold text-emerald-950">
            All three micro-checks are correct. You can continue.
          </p>
          <Link
            href={nextHref}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:mt-0"
          >
            {nextLabel} →
          </Link>
        </div>
      )}

      {!allCorrect && cloudConnected && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Progress is saved only after each check is answered correctly.
        </p>
      )}
    </section>
  );
}

export function LessonQuiz({
  courseSlug,
  lessonSlug,
  quiz,
  questionId,
  initialCompleted,
  initialScore,
  initialMethod,
  initialExplanation,
  cloudConnected,
  nextHref,
  nextLabel,
  humanReviewRequired = false,
  reviewState = "not_started",
  reviewFeedback = null,
}: LessonQuizProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState("");
  const [result, setResult] = useState<QuizResult | null>(
    initialCompleted
      ? {
          correct: true,
          score: initialScore ?? 100,
          feedback:
            "This checkpoint is already complete. You can review the method or submit another attempt.",
          method: initialMethod,
          explanation: initialExplanation,
          saved: cloudConnected,
          saveMessage: cloudConnected
            ? undefined
            : "Progress sync is temporarily unavailable.",
        }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const hasAnswer =
    quiz.kind === "choice"
      ? selectedIndex !== null
      : numericValue.trim().length > 0;
  const completionRecorded =
    result?.correct === true && result.saved;

  function clearResultForNewAttempt() {
    setResult(null);
    setRequestError("");
  }

  async function submitAnswer() {
    if (!hasAnswer || isSubmitting) {
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
          questionId,
          ...(quiz.kind === "choice"
            ? { selectedIndex }
            : { numericValue }),
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
    <section className="lesson-v1-checkpoint rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Pause • think • answer
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            The worked method appears only after a correct answer.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {quiz.kind === "choice" ? "Choose one" : `Enter a value in ${quiz.unit}`}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
        {quiz.question}
      </h2>

      {quiz.kind === "choice" ? (
        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Choose one answer</legend>
          {quiz.options.map((option, index) => {
            const selected = selectedIndex === index;
            const letter = String.fromCharCode(65 + index);

            return (
              <label
                key={`${letter}-${option}`}
                className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 shadow-sm"
                    : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  name="lesson-answer"
                  value={index}
                  checked={selected}
                  onChange={() => {
                    setSelectedIndex(index);
                    clearResultForNewAttempt();
                  }}
                  className="sr-only"
                />
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition ${
                    selected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {letter}
                </span>
                <span className="pt-1 leading-6 text-slate-800">{option}</span>
              </label>
            );
          })}
        </fieldset>
      ) : (
        <div className="mt-5 max-w-md">
          <label htmlFor="numeric-answer" className="text-sm font-semibold text-slate-800">
            Your calculated value
          </label>
          <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-300 bg-white transition focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100">
            <input
              id="numeric-answer"
              type="text"
              inputMode="decimal"
              value={numericValue}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setNumericValue(event.target.value);
                clearResultForNewAttempt();
              }}
              placeholder={quiz.placeholder}
              className="min-w-0 flex-1 border-0 px-4 py-3.5 outline-none"
            />
            <span className="grid min-w-20 place-items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
              {quiz.unit}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Engineering notation such as 0.55 kΩ is accepted when it is equivalent to the requested unit.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={submitAnswer}
        disabled={!hasAnswer || isSubmitting}
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
          className={`mt-5 overflow-hidden rounded-2xl border ${
            result.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="p-5">
            <p className="font-semibold">
              {result.correct
                ? `Correct — ${result.score}%`
                : "Not yet — use the hint and try again."}
            </p>
            <p className="mt-2 text-sm leading-6">{result.feedback}</p>

            {!result.correct && result.hint && (
              <div className="mt-4 rounded-xl border border-amber-300/70 bg-white/65 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                  Smallest useful hint
                </p>
                <p className="mt-2 text-sm leading-6">{result.hint}</p>
              </div>
            )}

            {result.correct && result.method && result.method.length > 0 && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-white/75 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                  Method revealed
                </p>
                <ol className="mt-3 space-y-3 text-sm leading-6">
                  {result.method.map((step: string, index: number) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {result.correct && result.explanation && (
              <div className="mt-4 text-sm leading-6">
                <strong>Why this is correct:</strong> {result.explanation}
              </div>
            )}

            {!result.saved && (
              <p className="mt-3 text-xs font-medium">
                {result.saveMessage ??
                  "Prototype mode: this result is stored only in this browser until Supabase is connected."}
              </p>
            )}

            {result.correct && humanReviewRequired && (
              <p className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs leading-5 text-violet-900">
                {reviewState === "revision_requested"
                  ? reviewFeedback ||
                    "Your teacher has requested a revision before this checkpoint can be approved."
                  : reviewState === "approved"
                    ? "This checkpoint has been approved by an authorised reviewer."
                    : "This online result confirms preparation only. Your teacher or authorised reviewer still owns the live checkpoint and release decision."}
              </p>
            )}
          </div>

          {result.correct && !completionRecorded && (
            <div className="border-t border-amber-200 bg-amber-50/70 p-4">
              <p className="text-sm font-semibold text-amber-950">
                Answer correct. Progress sync is temporarily unavailable.
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                You can continue reviewing the next lesson. Your result will sync when progress storage is available.
              </p>
            </div>
          )}

          {result.correct && completionRecorded && (
            <div className="border-t border-emerald-200 bg-white/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm font-semibold text-emerald-950">
                Checkpoint complete. Continue when you are ready.
              </p>
              <Link
                href={nextHref}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:mt-0"
              >
                {nextLabel} →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
