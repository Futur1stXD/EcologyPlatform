"use client";

import { useState } from "react";
import { Loader2, Wallet, Plus } from "lucide-react";
import { toast } from "@/lib/store/toast";

const AMOUNTS = [500, 1000, 2000, 5000, 10000];

interface Props {
  balance: number;
  cashbackEarned: number;
}

export function BalanceTopupWidget({ balance, cashbackEarned }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/balance/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Top-up failed", data.error ?? "Could not create checkout session");
        return;
      }
      toast.info("Redirecting to Stripe…");
      window.location.href = data.url;
    } catch {
      toast.error("Connection error", "Could not reach the payment server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={18} className="text-green-600" />
        <h2 className="text-base font-semibold text-[#0a0a0a]">Balance & Cashback</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-[#f5f5f5] px-4 py-3">
          <p className="text-xs text-[#6b6b6b] mb-0.5">Current balance</p>
          <p className="text-xl font-bold text-[#0a0a0a]">
            {balance.toLocaleString("ru-KZ")} ₸
          </p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
          <p className="text-xs text-[#6b6b6b] mb-0.5">Total cashback earned</p>
          <p className="text-xl font-bold text-green-600">
            +{cashbackEarned.toLocaleString("ru-KZ")} ₸
          </p>
        </div>
      </div>

      <p className="text-xs text-[#6b6b6b] mb-3 font-medium uppercase tracking-wide">Top up balance</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setSelected(a === selected ? null : a)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              selected === a
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                : "bg-white text-[#0a0a0a] border-[#e5e5e5] hover:border-[#0a0a0a]"
            }`}
          >
            {a.toLocaleString("ru-KZ")} ₸
          </button>
        ))}
      </div>

      <button
        onClick={handleTopup}
        disabled={!selected || loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] text-white font-medium px-5 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        {loading ? "Redirecting…" : selected ? `Top up ${selected.toLocaleString("ru-KZ")} ₸` : "Select an amount"}
      </button>

      <p className="mt-3 text-xs text-[#a3a3a3]">
        🎁 Every purchase earns 5% cashback credited to your balance
      </p>
    </div>
  );
}
