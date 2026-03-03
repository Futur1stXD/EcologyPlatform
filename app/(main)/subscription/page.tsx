"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ListingStats {
  productCount: number;
  plan: string;
  limit: number | null;
  remaining: number | null;
  currentPeriodEnd: string | null;
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const verifiedRef = useRef(false);

  const paramMessage = useMemo(() => {
    if (searchParams.get("success") === "true") return "✅ Subscription activated! Thank you.";
    if (searchParams.get("canceled") === "true") return "Payment cancelled.";
    return "";
  }, [searchParams]);

  const message = apiMessage || paramMessage;
  const isLoadingStats = statsLoading && !!session;

  // Fetch listing stats
  const fetchStats = () => {
    if (!session) return;
    fetch("/api/profile/listing-stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      });
  };

  useEffect(() => { fetchStats(); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verify subscription after Stripe redirects back with ?success=true&session_id=...
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const isSuccess = searchParams.get("success") === "true";
    if (!sessionId || !isSuccess || !session || verifiedRef.current) return;
    verifiedRef.current = true;

    fetch("/api/payments/verify-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then(async (res) => {
      if (res.ok) {
        // Remove session_id from URL, refresh stats
        router.replace("/subscription?success=true");
        fetchStats();
      }
    });
  }, [searchParams, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const subscribe = async () => {
    setLoading(true);
    setApiMessage("");
    const res = await fetch("/api/payments/create-checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setApiMessage("Error. Please try again later.");
    }
    setLoading(false);
  };

  const manageSubscription = async () => {
    setPortalLoading(true);
    setApiMessage("");
    const res = await fetch("/api/payments/portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setApiMessage("Could not open billing portal. Please try again.");
    }
    setPortalLoading(false);
  };

  const isPremium = stats?.plan === "PREMIUM";
  const periodEnd = stats?.currentPeriodEnd
    ? new Date(stats.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-3">Plans for Sellers</h1>
        <p className="text-[#6b6b6b] max-w-lg mx-auto">
          Expand your reach and get tools to grow your eco-product sales.
        </p>
        {isPremium && periodEnd && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 inline-block px-4 py-1.5 rounded-full border border-green-200">
            ⭐ Your Premium plan is active · Renews {periodEnd}
          </p>
        )}
      </div>

      {message && (
        <p className={`text-center text-sm mb-6 ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className={`border rounded-2xl p-6 relative ${!isPremium && session ? "border-2 border-[#0a0a0a]" : "border-[#e5e5e5]"}`}>
          {!isPremium && session && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-white text-xs px-3 py-1 rounded-full">
              Current plan
            </div>
          )}
          <p className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide mb-3">Free</p>
          <p className="text-3xl font-bold text-[#0a0a0a] mb-1">₸0</p>
          <p className="text-sm text-[#6b6b6b] mb-6">/ month</p>

          {/* Listing counter for FREE users */}
          {session && !isPremium && !isLoadingStats && stats && (
            <div className="mb-5 bg-[#fafafa] rounded-xl border border-[#e5e5e5] px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6b6b6b]">Listings used</span>
                <span className="text-xs font-bold text-[#0a0a0a]">
                  {stats.productCount}/{stats.limit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    (stats.remaining ?? 1) <= 0
                      ? "bg-red-500"
                      : (stats.remaining ?? 99) <= 2
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round(((stats.productCount) / (stats.limit ?? 10)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#6b6b6b] mt-1">
                {(stats.remaining ?? 0) <= 0
                  ? "Limit reached — upgrade to add more"
                  : `${stats.remaining} listing${stats.remaining === 1 ? "" : "s"} remaining`}
              </p>
            </div>
          )}

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
            {isPremium || !session ? "Free plan" : "Current plan"}
          </Button>
        </div>

        {/* Premium */}
        <div className={`border-2 rounded-2xl p-6 relative ${isPremium ? "border-green-500" : "border-[#0a0a0a]"}`}>
          {isPremium ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              ✓ Your plan
            </div>
          ) : (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-white text-xs px-3 py-1 rounded-full">
              Popular
            </div>
          )}

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

          {isLoadingStats ? (
            <Button className="w-full" disabled>
              <Loader2 size={14} className="animate-spin mr-2" />
              Loading...
            </Button>
          ) : isPremium ? (
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                loading={portalLoading}
                onClick={manageSubscription}
              >
                Manage subscription
              </Button>
              {periodEnd && (
                <p className="text-xs text-center text-[#6b6b6b]">Renews {periodEnd}</p>
              )}
            </div>
          ) : session ? (
            <Button className="w-full" loading={loading} onClick={subscribe}>
              Activate Premium
            </Button>
          ) : (
            <Button className="w-full" onClick={() => (window.location.href = "/login")}>
              Sign in to activate
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#a3a3a3] mt-8">
        Payment via Stripe. Cancel subscription at any time.{" "}
        {isPremium && (
          <button onClick={manageSubscription} className="underline cursor-pointer">
            Manage or cancel
          </button>
        )}
      </p>
    </div>
  );
}

