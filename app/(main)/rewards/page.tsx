import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBadgeInfo } from "@/lib/gamification";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function RewardsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cashbackBalance: true,
      cashbackEarned: true,
      badges: { orderBy: { awardedAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect("/login");

  const ALL_BADGES = ["FIRST_PURCHASE", "GREEN_BUYER", "TEN_PURCHASES", "ECO_HERO"] as const;
  const earnedBadges = new Set(user.badges.map((b: { badge: string }) => b.badge));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">My Rewards</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">Make eco purchases, earn cashback and unlock badges</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-[#e5e5e5] rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-[#0a0a0a]">{user._count.orders}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Purchases</p>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-green-700">{formatPrice(user.cashbackBalance)}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Cashback available</p>
        </div>
        <div className="border border-[#e5e5e5] rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-[#0a0a0a]">{formatPrice(user.cashbackEarned)}</p>
          <p className="text-xs text-[#6b6b6b] mt-1">Total cashback earned</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const info = getBadgeInfo(badge as Parameters<typeof getBadgeInfo>[0]);
            const earned = earnedBadges.has(badge);
            const awardedAt = user.badges.find((b: { badge: string; awardedAt: Date }) => b.badge === badge)?.awardedAt;
            return (
              <div
                key={badge}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${
                  earned ? "border-[#0a0a0a]" : "border-[#e5e5e5] opacity-50"
                }`}
              >
                <span className="text-2xl">{earned ? info.icon : "🔒"}</span>
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{info.label}</p>
                  <p className="text-xs text-[#6b6b6b]">
                    {earned && awardedAt ? `Earned ${formatDate(awardedAt)}` : info.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
