import { BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const BADGE_CRITERIA: Partial<Record<BadgeType, { label: string; icon: string; desc: string }>> = {
  [BadgeType.FIRST_PURCHASE]: { label: "First Purchase", icon: "🛍️", desc: "Completed your first order" },
  [BadgeType.TEN_PURCHASES]: { label: "10 Purchases",   icon: "🔟", desc: "Made 10 or more orders" },
  [BadgeType.GREEN_BUYER]:   { label: "Green Buyer",    icon: "🌿", desc: "Made 5 or more eco purchases" },
  [BadgeType.ECO_HERO]:      { label: "Eco Hero",       icon: "🦸", desc: "Made 20 or more eco purchases" },
};

export function getBadgeInfo(badge: BadgeType) {
  return BADGE_CRITERIA[badge] ?? { label: badge, icon: "🏅", desc: "" };
}

// Check badge eligibility after a purchase
export async function rewardPurchase(userId: string, ordersCount: number) {
  const badgesToAward: BadgeType[] = [];

  if (ordersCount === 1)  badgesToAward.push(BadgeType.FIRST_PURCHASE);
  if (ordersCount >= 5)   badgesToAward.push(BadgeType.GREEN_BUYER);
  if (ordersCount >= 10)  badgesToAward.push(BadgeType.TEN_PURCHASES);
  if (ordersCount >= 20)  badgesToAward.push(BadgeType.ECO_HERO);

  for (const badge of badgesToAward) {
    await prisma.userBadge.upsert({
      where: { userId_badge: { userId, badge } },
      update: {},
      create: { userId, badge },
    });
  }
}
