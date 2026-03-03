import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBadgeInfo } from "@/lib/gamification";
import { formatDate } from "@/lib/utils";

const LEVELS = [
  { label: "Новичок", minPoints: 0, icon: "🌱" },
  { label: "Знаток", minPoints: 100, icon: "🌿" },
  { label: "Защитник", minPoints: 300, icon: "🌳" },
  { label: "Eco-Герой", minPoints: 600, icon: "🦸" },
];

export default async function RewardsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ecoPoints: true,
      badges: { orderBy: { awardedAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect("/login");

  const currentLevel = [...LEVELS].reverse().find((l) => user.ecoPoints >= l.minPoints) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.minPoints > user.ecoPoints);
  const progress = nextLevel
    ? Math.round(((user.ecoPoints - (currentLevel?.minPoints ?? 0)) / (nextLevel.minPoints - (currentLevel?.minPoints ?? 0))) * 100)
    : 100;

  const ALL_BADGES = ["FIRST_PURCHASE", "TEN_PURCHASES", "GREEN_BUYER", "ECO_HERO", "HUNDRED_POINTS"];
  const earnedBadges = new Set(user.badges.map((b) => b.badge));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">Мои награды</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">Делайте eco-покупки и зарабатывайте очки и значки</p>

      {/* Level & points */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl mb-1">{currentLevel.icon}</p>
            <h2 className="text-lg font-bold text-[#0a0a0a]">{currentLevel.label}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#0a0a0a]">{user.ecoPoints}</p>
            <p className="text-xs text-[#6b6b6b]">eco-очков</p>
          </div>
        </div>

        {nextLevel && (
          <>
            <div className="h-2 w-full bg-[#e5e5e5] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#0a0a0a] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#6b6b6b]">
              {user.ecoPoints} / {nextLevel.minPoints} до уровня «{nextLevel.label} {nextLevel.icon}»
            </p>
          </>
        )}

        <p className="text-sm text-[#6b6b6b] mt-3">
          Всего покупок: <span className="font-medium text-[#0a0a0a]">{user._count.orders}</span>
        </p>
      </div>

      {/* How to earn */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Как заработать очки</h2>
        <div className="space-y-2">
          {[
            { action: "Совершить покупку", points: "+20 очков" },
            { action: "Оставить отзыв", points: "+5 очков (скоро)" },
            { action: "Пригласить друга", points: "+50 очков (скоро)" },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between text-sm">
              <span className="text-[#6b6b6b]">{item.action}</span>
              <span className="font-medium text-[#0a0a0a]">{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Значки</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const info = getBadgeInfo(badge as Parameters<typeof getBadgeInfo>[0]);
            const earned = earnedBadges.has(badge as Parameters<typeof getBadgeInfo>[0]);
            const awardedAt = user.badges.find((b) => b.badge === badge)?.awardedAt;

            return (
              <div
                key={badge}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${
                  earned ? "border-[#0a0a0a]" : "border-[#e5e5e5] opacity-50"
                }`}
              >
                <span className="text-2xl">{earned ? "✅" : "🔒"}</span>
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{info.label}</p>
                  {earned && awardedAt ? (
                    <p className="text-xs text-[#6b6b6b]">Получено {formatDate(awardedAt)}</p>
                  ) : (
                    <p className="text-xs text-[#a3a3a3]">Ещё не получен</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
