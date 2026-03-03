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
  const cashback = Math.round(price * 0.05 * 100) / 100;

  useEffect(() => {
    if (!session) return;
    fetch("/api/payments/balance")
      .then((r) => r.json())
      .then((d) => { if (typeof d.balance === "number") setBalance(d.balance); })
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
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Purchase failed", data.error ?? "Could not complete purchase");
        return;
      }
      toast.success("Purchase successful!", `+${cashback.toLocaleString("ru-KZ")} ₸ cashback added to your balance`);
      router.push(`/products/${productId}?purchased=true`);
      router.refresh();
    } catch {
      toast.error("Connection error", "Could not reach the server");
    } finally {
      setLoadingBalance(false);
    }
  };

  const hasSufficientBalance = balance !== null && balance >= price;

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
            ? `Pay with Balance (₸${balance.toLocaleString("ru-KZ")})`
            : `Insufficient balance (₸${(balance ?? 0).toLocaleString("ru-KZ")})`}
        </button>
      )}

      {/* Cashback note */}
      <p className="text-xs text-center text-[#6b6b6b]">
        🎁 +{cashback.toLocaleString("ru-KZ")} ₸ cashback (5%) on any payment
      </p>

      {!session && (
        <p className="text-xs text-center text-[#6b6b6b]">Sign in required to purchase</p>
      )}
    </div>
  );
}

