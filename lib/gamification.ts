import { BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const BADGE_CRITERIA = {
  [BadgeType.FIRST_PURCHASE]: { label: "First Purchase", points: 50 },
  [BadgeType.TEN_PURCHASES]: { label: "10 Purchases", points: 200 },
  [BadgeType.GREEN_BUYER]: { label: "Green Buyer", points: 150 },
  [BadgeType.ECO_HERO]: { label: "Eco Hero", points: 500 },
  [BadgeType.HUNDRED_POINTS]: { label: "100 Points", points: 0 },
};

export function getBadgeInfo(badge: BadgeType) {
  return BADGE_CRITERIA[badge];
}

// Award eco-points and check badge eligibility after a purchase
export async function rewardPurchase(userId: string, ordersCount: number) {
  const pointsToAdd = 20;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { ecoPoints: { increment: pointsToAdd } },
    select: { ecoPoints: true },
  });

  const badgesToAward: BadgeType[] = [];

  if (ordersCount === 1) badgesToAward.push(BadgeType.FIRST_PURCHASE);
  if (ordersCount >= 10) badgesToAward.push(BadgeType.TEN_PURCHASES);
  if (ordersCount >= 5) badgesToAward.push(BadgeType.GREEN_BUYER);
  if (ordersCount >= 20) badgesToAward.push(BadgeType.ECO_HERO);
  if (user.ecoPoints >= 100) badgesToAward.push(BadgeType.HUNDRED_POINTS);

  for (const badge of badgesToAward) {
    await prisma.userBadge.upsert({
      where: { userId_badge: { userId, badge } },
      update: {},
      create: { userId, badge },
    });
  }
}
