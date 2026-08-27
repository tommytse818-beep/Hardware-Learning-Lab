"use client";

import { AvatarBadge } from "@/components/avatar-badge";
import { getFeaturedAvatarOptions } from "@/lib/avatars";

type AvatarPickerProps = {
  defaultValue?: string;
};

export function AvatarPicker({ defaultValue = "spark" }: AvatarPickerProps) {
  const options = getFeaturedAvatarOptions();
  const selectedDefault = options.some(
    (option) => option.key === defaultValue,
  )
    ? defaultValue
    : "spark";

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">
        Choose your avatar
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.key}
            className="group relative flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-emerald-100 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <input
              type="radio"
              name="avatar"
              value={option.key}
              defaultChecked={selectedDefault === option.key}
              className="sr-only"
            />
            <AvatarBadge
              name={option.label}
              avatarKey={option.key}
              size="lg"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
