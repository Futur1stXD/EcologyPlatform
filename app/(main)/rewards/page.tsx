import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBadgeInfo, BADGE_THRESHOLDS } from "@/lib/gamification";
import { formatDate, formatPrice } from "@/lib/utils";
import { BadgeType } from "@prisma/client";

// Progress bar component (server-side renderable)
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-[#f0f0f0] overflow-hidden">
      <div
        className="h-full rounded-full bg-green-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function RewardsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ecoPoints: true,
      cashbackBalance: true,
      cashbackEarned: true,
      badges: { orderBy: { awardedAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect("/login");

  const ALL_BADGES: BadgeType[] = [
    BadgeType.FIRST_PURCHASE,
    BadgeType.GREEN_BUYER,
    BadgeType.TEN_PURCHASES,
    BadgeType.ECO_HERO,
    BadgeType.HUNDRED_POINTS,
  ];
  const earnedBadges = new Set(user.badges.map((b: { badge: string }) => b.badge));

  const ordersCount = user._count.orders;
  const ecoPoints  = user.ecoPoints;

  // Progress value per badge
  function badgeProgress(badge: BadgeType): { current: number; target: number } {
    const t = BADGE_THRESHOLDS[badge];
    if (!t) return { current: 0, target: 1 };
    return {
      current: t.field === "orders" ? ordersCount : ecoPoints,
      target: t.target,
    };
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">My Rewards</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">Make eco purchases, earn eco-coins and unlock badges</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#e5e5e5] rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-[#0a0a0a]">{ordersCount}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Purchases</p>
        </div>
        <div className="border border-yellow-200 bg-yellow-50 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-yellow-600">🪙 {ecoPoints}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Eco-coins</p>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-green-700">{formatPrice(user.cashbackBalance)}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Cashback available</p>
        </div>
        <div className="border border-[#e5e5e5] rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-[#0a0a0a]">{formatPrice(user.cashbackEarned)}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Cashback earned total</p>
        </div>
      </div>

      {/* Eco-coins how-it-works */}
      <div className="border border-yellow-200 bg-yellow-50 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">🪙 How eco-coins work</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Every purchase",        value: "+1 coin per 10 ₸ spent" },
            { label: "Spend at checkout",     value: "1 coin = 1 ₸ discount" },
            { label: "100 coins milestone",   value: "Unlock 100 Eco-Coins badge 🪙" },
            { label: "Eco Hero milestone",    value: "20 purchases → Eco Hero 🦸" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between">
              <span className="text-[#6b6b6b]">{r.label}</span>
              <span className="font-medium text-[#0a0a0a]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cashback info */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">💰 How cashback works</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Every purchase via Stripe or Balance", value: "+5% cashback" },
            { label: "Apply at checkout",                    value: "Cashback balance → discount" },
            { label: "No expiry",                            value: "Cashback never expires" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between">
              <span className="text-[#6b6b6b]">{r.label}</span>
              <span className="font-medium text-[#0a0a0a]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">🏅 Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_BADGES.map((badge) => {
            const info     = getBadgeInfo(badge);
            const earned   = earnedBadges.has(badge);
            const awardedAt = user.badges.find((b: { badge: string; awardedAt: Date }) => b.badge === badge)?.awardedAt;
            const progress = badgeProgress(badge);

            return (
              <div
                key={badge}
                className={`flex flex-col gap-2 rounded-xl border p-4 transition-opacity ${
                  earned
                    ? "border-[#0a0a0a] bg-white shadow-sm"
                    : "border-[#e5e5e5] opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{earned ? info.icon : "🔒"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0a0a0a] truncate">{info.label}</p>
                    <p className="text-xs text-[#6b6b6b]">
                      {earned && awardedAt
                        ? `Earned ${formatDate(awardedAt)}`
                        : info.desc}
                    </p>
                  </div>
                  {earned && (
                    <span className="shrink-0 rounded-full bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5">
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Progress bar (only shown when not yet earned) */}
                {!earned && (
                  <div className="space-y-1">
                    <ProgressBar value={progress.current} max={progress.target} />
                    <p className="text-xs text-[#a3a3a3] text-right">
                      {Math.min(progress.current, progress.target)} / {progress.target}
                    </p>
                  </div>
                )}

                {/* Flavor text when earned */}
                {earned && (
                  <p className="text-xs text-green-600 italic">{info.flavor}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
