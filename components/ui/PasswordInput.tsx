"use client";

import { forwardRef, useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

// ── Strength logic ────────────────────────────────────────────────────────────

export interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function getPasswordCriteria(value: string): PasswordCriteria[] {
  return [
    { label: "At least 8 characters",          met: value.length >= 8 },
    { label: "Uppercase letter (A–Z)",          met: /[A-Z]/.test(value) },
    { label: "Lowercase letter (a–z)",          met: /[a-z]/.test(value) },
    { label: "Number (0–9)",                    met: /[0-9]/.test(value) },
    { label: "Special character (!@#$%^&*…)",   met: /[^A-Za-z0-9]/.test(value) },
  ];
}

export function getStrength(criteria: PasswordCriteria[]): "weak" | "fair" | "strong" {
  const met = criteria.filter((c) => c.met).length;
  if (met <= 2) return "weak";
  if (met <= 3) return "fair";
  return "strong";
}

const STRENGTH_CONFIG = {
  weak:   { label: "Weak",   color: "bg-red-500",    text: "text-red-500",    filled: 1 },
  fair:   { label: "Fair",   color: "bg-yellow-400", text: "text-yellow-500", filled: 2 },
  strong: { label: "Strong", color: "bg-green-500",  text: "text-green-600",  filled: 3 },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, showStrength = false, onChange, value, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const [internal, setInternal] = useState("");

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternal(e.target.value);
        onChange?.(e);
      },
      [onChange]
    );

    // Use controlled value for strength meter when provided, else internal state
    const displayValue = value !== undefined ? (value as string) : internal;
    const criteria = getPasswordCriteria(displayValue);
    const strength = getStrength(criteria);
    const cfg = STRENGTH_CONFIG[strength];
    const hasValue = displayValue.length > 0;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-[#0a0a0a]">{label}</label>
        )}

        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={visible ? "text" : "password"}
            value={value !== undefined ? value : internal}
            onChange={handleChange}
            className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-[#a3a3a3] focus:ring-2 focus:ring-[#0a0a0a]/10 ${
              error
                ? "border-red-400 bg-red-50 focus:border-red-400"
                : "border-[#e5e5e5] bg-white focus:border-[#0a0a0a]"
            }`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Strength meter — only shown while user is typing */}
        {showStrength && hasValue && (
          <div className="mt-1 space-y-2">
            {/* Bar */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= cfg.filled ? cfg.color : "bg-[#e5e5e5]"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
            </div>

            {/* Criteria list */}
            <ul className="space-y-0.5">
              {criteria.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    c.met ? "text-green-600" : "text-[#a3a3a3]"
                  }`}
                >
                  <span className="text-[10px]">{c.met ? "✓" : "○"}</span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
