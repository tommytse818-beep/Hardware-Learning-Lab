"use client";

import { useFormStatus } from "react-dom";

type PasswordResetSubmitButtonProps = {
  disabled?: boolean;
};

export function PasswordResetSubmitButton({
  disabled = false,
}: PasswordResetSubmitButtonProps) {
  const { pending } = useFormStatus();
  const unavailable = disabled || pending;

  return (
    <button
      type="submit"
      disabled={unavailable}
      aria-disabled={unavailable}
      className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? "Sending recovery link…" : "Email recovery link"}
    </button>
  );
}
