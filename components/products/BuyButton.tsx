"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BuyButtonProps {
  productId: string;
  price: number;
  isSeller: boolean;
  purchased?: boolean;
}

export function BuyButton({ productId, price, isSeller, purchased }: BuyButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleBuy = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/buy-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Payment error");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] text-white font-medium px-5 py-3.5 hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ShoppingCart size={16} />
        )}
        {loading ? "Redirecting..." : "Buy via Stripe"}
      </button>
      {!session && (
        <p className="text-xs text-center text-[#6b6b6b]">Sign in required to purchase</p>
      )}
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
