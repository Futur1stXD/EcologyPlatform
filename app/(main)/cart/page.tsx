"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, Leaf, CheckCircle, ArrowLeft, Wallet } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/store/toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCartStore();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [cashbackBalance, setCashbackBalance] = useState<number>(0);
  const [useCashback, setUseCashback] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/payments/balance")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.balance === "number") setBalance(d.balance);
        if (typeof d.cashbackBalance === "number") setCashbackBalance(d.cashbackBalance);
      })
      .catch(() => {});
  }, [session]);

  // Verify purchase after Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const purchased = searchParams.get("purchased");
    if (!sessionId || !purchased || verified) return;

    setVerified(true);
    fetch("/api/payments/verify-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then((r) => {
      if (r.ok) {
        clearCart();
        router.replace("/cart?success=true");
      }
    });
  }, [searchParams, clearCart, router, verified]);

  const handleCheckout = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) {
        const msg = data.error ?? "Checkout error";
        setError(msg);
        toast.error("Checkout failed", msg);
        return;
      }
      if (data.url) {
        toast.info("Redirecting to payment…");
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceCheckout = async () => {
    setError("");
    setLoadingBalance(true);
    try {
      const res = await fetch("/api/payments/cart-balance-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          useCashback,
        }),
      });
      const data = await res.json() as { orderId?: string; cashback?: number; cashbackApplied?: number; error?: string };
      if (!res.ok) {
        const msg = data.error ?? "Checkout error";
        setError(msg);
        toast.error("Purchase failed", msg);
        return;
      }
      const parts: string[] = [];
      if (data.cashbackApplied && data.cashbackApplied > 0) parts.push(`-${data.cashbackApplied.toLocaleString("ru-KZ")} ₸ cashback`);
      parts.push(`+${(data.cashback ?? 0).toLocaleString("ru-KZ")} ₸ new cashback`);
      toast.success("Order placed!", parts.join(" · "));
      clearCart();
      router.push("/cart?success=true");
    } finally {
      setLoadingBalance(false);
    }
  };

  if (!mounted) return null;

  const isSuccess = searchParams.get("success") === "true";

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-5 rounded-full bg-green-50 border-2 border-green-200">
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Order placed!</h1>
        <p className="text-[#6b6b6b] mb-2">Payment successful. Cashback has been credited to your account.</p>
        <p className="text-sm text-green-600 mb-8 font-medium">🌿 Thank you for choosing eco-friendly!</p>
        <div className="flex justify-center gap-3">
          <Link href="/products"><Button size="lg">Continue shopping</Button></Link>
          <Link href="/profile"><Button variant="outline" size="lg">My orders</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Cart</h1>
        {totalItems() > 0 && (
          <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs text-white font-medium">
            {totalItems()}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-6 rounded-full bg-[#f5f5f5]">
            <ShoppingCart size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-[#0a0a0a]">Your cart is empty</h2>
          <p className="text-[#6b6b6b] text-sm max-w-xs">
            Add eco-friendly products directly from the product page
          </p>
          <Link href="/products"><Button size="lg">Go to catalogue</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 border border-[#e5e5e5] rounded-2xl bg-white"
              >
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 rounded-xl object-cover bg-[#f5f5f5]"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-[#f5f5f5] flex items-center justify-center">
                      <Leaf size={24} className="text-gray-300" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-medium text-[#0a0a0a] hover:underline line-clamp-2 leading-snug"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-[#6b6b6b] mt-0.5">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                  <p className="text-base font-bold text-green-600 mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#a3a3a3] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-7 w-7 rounded-lg border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-7 w-7 rounded-lg border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-[#a3a3a3] hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border border-[#e5e5e5] rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-[#0a0a0a] mb-4">Summary</h2>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Items</span>
                  <span>{totalItems()} pcs.</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#0a0a0a] pt-2 border-t border-[#e5e5e5]">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
              )}

              <Button
                size="lg"
                className="w-full"
                loading={loading}
                onClick={handleCheckout}
              >
                Pay via Stripe
              </Button>

              {/* Balance payment */}
              {session && (
                <>
                  {balance !== null && (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-[#6b6b6b]">
                        <Wallet size={14} />
                        <span>Your balance</span>
                      </div>
                      <span className={`font-semibold ${
                        balance >= totalPrice() ? "text-green-600" : "text-[#a3a3a3]"
                      }`}>{formatPrice(balance)}</span>
                    </div>
                  )}

                  {/* Cashback toggle */}
                  {cashbackBalance > 0 && (
                    <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm px-1">
                      <input
                        type="checkbox"
                        checked={useCashback}
                        onChange={(e) => setUseCashback(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 accent-green-600"
                      />
                      <span className="text-[#0a0a0a]">
                        Use cashback{" "}
                        <span className="font-semibold text-green-600">
                          {cashbackBalance.toLocaleString("ru-KZ")} ₸
                        </span>
                        {useCashback && (
                          <span className="text-[#6b6b6b]"> → -{Math.min(cashbackBalance, totalPrice()).toLocaleString("ru-KZ")} ₸</span>
                        )}
                      </span>
                    </label>
                  )}

                  {/* Eco-points toggle */}
                  {ecoPoints > 0 && (
                    <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm px-1">
                      <input
                        type="checkbox"
                        checked={useEcoPoints}
                        onChange={(e) => setUseEcoPoints(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 accent-yellow-500"
                      />
                      <span className="text-[#0a0a0a]">
                        Use eco-points{" "}
                        <span className="font-semibold text-yellow-600">{ecoPoints} pts</span>
                        <span className="text-[#a3a3a3]"> (1 pt = 1 ₸)</span>
                        {useEcoPoints && (
                          <span className="text-[#6b6b6b]"> → -{Math.min(ecoPoints, Math.max(0, totalPrice() - (useCashback ? Math.min(cashbackBalance, totalPrice()) : 0))).toLocaleString("ru-KZ")} ₸</span>
                        )}
                      </span>
                    </label>
                  )}

                  {useCashback && cashbackBalance > 0 ? (
                    <div className="mt-2 flex justify-between text-sm font-bold text-green-700">
                      <span>To pay</span>
                      <span>{formatPrice(Math.max(0, totalPrice() - (useCashback ? Math.min(cashbackBalance, totalPrice()) : 0)))}</span>
                    </div>
                  ) : null}

                  <button
                    onClick={handleBalanceCheckout}
                    disabled={loadingBalance || loading || balance === null || balance < Math.max(0, totalPrice() - (useCashback ? Math.min(cashbackBalance, totalPrice()) : 0))}
                    title={balance !== null && balance < totalPrice() ? "Top up your balance in Profile" : undefined}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] bg-white text-[#0a0a0a] font-medium px-5 py-3 text-sm hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet size={15} />
                    {loadingBalance ? "Processing..." : "Pay with Balance"}
                  </button>
                  <p className="mt-2 text-xs text-center text-[#6b6b6b]">
                    🎁 +{(Math.round(totalPrice() * 0.05 * 100) / 100).toLocaleString("ru-KZ")} ₸ cashback (5%) on any payment
                  </p>
                </>
              )}

              <div className="mt-4 flex items-start gap-2">
                <Leaf size={14} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-[#6b6b6b] leading-relaxed">
                  Badges are awarded for every purchase
                </p>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
