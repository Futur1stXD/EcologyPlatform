"use client";

import { useEffect, useState } from "react";
import { Receipt, Download, ExternalLink, Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount: number;
  currency: string;
  created: number;
  pdf: string | null;
  hostedUrl: string | null;
  periodStart: number;
  periodEnd: number;
}

function fmt(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  open: "bg-yellow-50 text-yellow-700 border-yellow-200",
  void: "bg-[#f5f5f5] text-[#6b6b6b] border-[#e5e5e5]",
  uncollectible: "bg-red-50 text-red-700 border-red-200",
};

export function SubscriptionBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6 flex items-center gap-2 text-[#6b6b6b]">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading billing history…</span>
      </div>
    );
  }

  if (!invoices.length) return null;

  return (
    <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt size={18} className="text-[#0a0a0a]" />
        <h2 className="text-base font-semibold text-[#0a0a0a]">Billing history</h2>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between gap-4 py-3 border-b border-[#f0f0f0] last:border-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-[#0a0a0a]">
                  {inv.number ?? inv.id.slice(-8)}
                </p>
                <span
                  className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${
                    STATUS_STYLE[inv.status ?? ""] ?? STATUS_STYLE.void
                  }`}
                >
                  {inv.status}
                </span>
              </div>
              <p className="text-xs text-[#6b6b6b] mt-0.5">
                {fmt(inv.periodStart)} – {fmt(inv.periodEnd)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <p className="text-sm font-semibold text-[#0a0a0a]">
                {inv.amount.toLocaleString("ru-KZ")} {inv.currency.toUpperCase()}
              </p>
              <div className="flex items-center gap-1.5">
                {inv.pdf && (
                  <a
                    href={inv.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download PDF"
                    className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <Download size={14} />
                  </a>
                )}
                {inv.hostedUrl && (
                  <a
                    href={inv.hostedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View invoice"
                    className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
