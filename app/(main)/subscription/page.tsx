"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const subscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/payments/create-checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setMessage("Ошибка. Попробуйте позже.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-3">Plans for Sellers</h1>
        <p className="text-[#6b6b6b] max-w-lg mx-auto">
          Expand your reach and get tools to grow your eco-product sales.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="border border-[#e5e5e5] rounded-2xl p-6">
          <p className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide mb-3">Free</p>
          <p className="text-3xl font-bold text-[#0a0a0a] mb-1">₸0</p>
          <p className="text-sm text-[#6b6b6b] mb-6">/ month</p>

          <ul className="space-y-2 mb-6">
            {[
              { label: "Up to 10 products", ok: true },
              { label: "Basic analytics", ok: true },
              { label: "Standard listing", ok: true },
              { label: "Top placement", ok: false },
              { label: "Featured badge", ok: false },
              { label: "Extended analytics", ok: false },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-[#d4d4d4] flex-shrink-0" />
                )}
                <span className={item.ok ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}>{item.label}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Current plan
          </Button>
        </div>

        {/* Premium */}
        <div className="border-2 border-[#0a0a0a] rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-white text-xs px-3 py-1 rounded-full">
            Popular
          </div>

          <p className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide mb-3">Premium</p>
          <p className="text-3xl font-bold text-[#0a0a0a] mb-1">₸9 990</p>
          <p className="text-sm text-[#6b6b6b] mb-6">/ month</p>

          <ul className="space-y-2 mb-6">
            {[
              "Unlimited products",
              "Top placement in the catalogue",
              "⭐ Premium badge on products",
              "Featured position on the homepage",
              "Extended sales analytics",
              "Priority support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-[#0a0a0a]">{item}</span>
              </li>
            ))}
          </ul>

          {session ? (
            <Button className="w-full" loading={loading} onClick={subscribe}>
              Activate Premium
            </Button>
          ) : (
            <Button className="w-full" onClick={() => (window.location.href = "/login")}>
              Sign in to activate
            </Button>
          )}

          {message && <p className="text-xs text-red-500 text-center mt-2">{message}</p>}
        </div>
      </div>

      <p className="text-center text-xs text-[#a3a3a3] mt-8">
        Payment via Stripe. Cancel subscription at any time.
      </p>
    </div>
  );
}
