"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Wallet } from "lucide-react";
import { toast } from "@/lib/store/toast";

interface BuyButtonProps {
  productId: string;
  price: number;
  isSeller: boolean;
  purchased?: boolean;
}

export function BuyButton({ productId, price, isSeller, purchased }: BuyButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [cashbackBalance, setCashbackBalance] = useState<number>(0);
  const [ecoPoints, setEcoPoints] = useState<number>(0);
  const [useCashback, setUseCashback] = useState(false);
  const [useEcoPoints, setUseEcoPoints] = useState(false);
  const cashbackEarned = Math.round(price * 0.05 * 100) / 100;

  const cashbackApplied = useCashback ? Math.min(cashbackBalance, price) : 0;
  const priceAfterCashback = Math.round((price - cashbackApplied) * 100) / 100;
  const ecoPointsApplied = useEcoPoints ? Math.min(ecoPoints, priceAfterCashback) : 0;
  const effectivePrice = Math.round((priceAfterCashback - ecoPointsApplied) * 100) / 100;

  useEffect(() => {
    if (!session) return;
    fetch("/api/payments/balance")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.balance === "number") setBalance(d.balance);
        if (typeof d.cashbackBalance === "number") setCashbackBalance(d.cashbackBalance);
        if (typeof d.ecoPoints === "number") setEcoPoints(d.ecoPoints);
      })
      .catch(() => {});
  }, [session]);

  if (purchased) {
    return (
      <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-200 px-5 py-3">
        <span className="text-green-700 font-medium text-sm">✓ Product purchased</span>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#f5f5f5] px-5 py-3">
        <span className="text-[#6b6b6b] text-sm">This is your product</span>
      </div>
    );
  }

  const handleBuyStripe = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }
    setLoadingStripe(true);
    try {
      const res = await fetch("/api/payments/buy-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Payment failed", data.error ?? "Payment error");
        return;
      }
      toast.info("Redirecting to payment…");
      window.location.href = data.url;
    } catch {
      toast.error("Connection error", "Could not reach the payment server");
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleBuyBalance = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }
    setLoadingBalance(true);
    try {
      const res = await fetch("/api/payments/buy-with-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, useCashback, useEcoPoints }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Purchase failed", data.error ?? "Could not complete purchase");
        return;
      }
      const parts: string[] = [];
      if (data.cashbackApplied > 0) parts.push(`-${data.cashbackApplied.toLocaleString("ru-KZ")} ₸ cashback`);
      if (data.ecoPointsApplied > 0) parts.push(`-${Math.round(data.ecoPointsApplied)} pts`);
      parts.push(`+${data.cashback.toLocaleString("ru-KZ")} ₸ new cashback`);
      toast.success("Purchase successful!", parts.join(" · "));
      router.push(`/products/${productId}?purchased=true`);
      router.refresh();
    } catch {
      toast.error("Connection error", "Could not reach the server");
    } finally {
      setLoadingBalance(false);
    }
  };

  const hasSufficientBalance = balance !== null && balance >= effectivePrice;

  return (
    <div className="space-y-2">
      {/* Stripe button */}
      <button
        onClick={handleBuyStripe}
        disabled={loadingStripe || loadingBalance}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] text-white font-medium px-5 py-3.5 hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loadingStripe ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
        {loadingStripe ? "Redirecting..." : "Buy via Stripe"}
      </button>

      {/* Balance button — shown only to signed-in users */}
      {session && (
        <>
          {/* Cashback toggle */}
          {cashbackBalance > 0 && (
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1">
              <input
                type="checkbox"
                checked={useCashback}
                onChange={(e) => setUseCashback(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-green-600"
              />
              <span className="text-sm text-[#0a0a0a]">
                Use cashback{" "}
                <span className="font-semibold text-green-600">
                  {cashbackBalance.toLocaleString("ru-KZ")} ₸
                </span>
                {useCashback && cashbackApplied > 0 && (
                  <span className="text-[#6b6b6b]"> → -{cashbackApplied.toLocaleString("ru-KZ")} ₸</span>
                )}
              </span>
            </label>
          )}

          {/* Eco-points toggle */}
          {ecoPoints > 0 && (
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1">
              <input
                type="checkbox"
                checked={useEcoPoints}
                onChange={(e) => setUseEcoPoints(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-yellow-500"
              />
              <span className="text-sm text-[#0a0a0a]">
                Use eco-points{" "}
                <span className="font-semibold text-yellow-600">
                  {ecoPoints} pts
                </span>
                <span className="text-[#a3a3a3]"> (1 pt = 1 ₸)</span>
                {useEcoPoints && ecoPointsApplied > 0 && (
                  <span className="text-[#6b6b6b]"> → -{Math.round(ecoPointsApplied).toLocaleString("ru-KZ")} ₸</span>
                )}
              </span>
            </label>
          )}

          <button
            onClick={handleBuyBalance}
            disabled={loadingBalance || loadingStripe || !hasSufficientBalance}
            title={!hasSufficientBalance ? "Top up your balance in Profile" : undefined}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] bg-white text-[#0a0a0a] font-medium px-5 py-3.5 hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingBalance ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
            {loadingBalance
              ? "Processing..."
              : balance === null
              ? "Pay with Balance"
              : hasSufficientBalance
              ? effectivePrice < price
                ? `Pay ${effectivePrice.toLocaleString("ru-KZ")} ₸ (Balance)`
                : `Pay with Balance (₸${balance.toLocaleString("ru-KZ")})`
              : `Insufficient balance (₸${(balance ?? 0).toLocaleString("ru-KZ")})`}
          </button>
        </>
      )}

      {/* Cashback note */}
      <p className="text-xs text-center text-[#6b6b6b]">
        🎁 +{cashbackEarned.toLocaleString("ru-KZ")} ₸ cashback (5%) on any payment
      </p>

      {!session && (
        <p className="text-xs text-center text-[#6b6b6b]">Sign in required to purchase</p>
      )}
    </div>
  );
}

