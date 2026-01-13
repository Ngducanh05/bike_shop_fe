// src/components/admin/AdminStatusSelect.tsx
import React from "react";

export function AdminStatusSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
      className={[
        "w-full px-3 py-2 rounded-xl border text-sm transition",
        "bg-zinc-900 text-white border-white/10",
        "focus:outline-none focus:ring-2 focus:ring-white/10",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className ?? "",
      ].join(" ")}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-zinc-900 text-white">
          {o}
        </option>
      ))}
    </select>
  );
}
