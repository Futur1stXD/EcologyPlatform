"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast } from "@/lib/store/toast";
import { cn } from "@/lib/utils";

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />,
  error:   <XCircle     size={16} className="text-red-500   shrink-0 mt-0.5" />,
  info:    <Info        size={16} className="text-blue-500  shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />,
};

const STYLES = {
  success: "border-green-200 bg-green-50",
  error:   "border-red-200   bg-red-50",
  info:    "border-blue-200  bg-blue-50",
  warning: "border-yellow-200 bg-yellow-50",
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => remove(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl border px-4 py-3 shadow-md transition-all duration-300",
        STYLES[toast.type],
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0a0a0a] leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-[#6b6b6b] mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
