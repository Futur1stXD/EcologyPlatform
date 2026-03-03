import { BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const BADGE_CRITERIA: Partial<Record<BadgeType, { label: string; icon: string; desc: string; flavor: string }>> = {
  [BadgeType.FIRST_PURCHASE]: {
    label: "First Purchase",
    icon: "🛍️",
    desc: "Complete your first order",
    flavor: "Welcome to the eco community!",
  },
  [BadgeType.GREEN_BUYER]: {
    label: "Green Buyer",
    icon: "🌿",
    desc: "Make 5 or more purchases",
    flavor: "You're choosing a greener planet.",
  },
  [BadgeType.TEN_PURCHASES]: {
    label: "10 Purchases",
    icon: "🔟",
    desc: "Make 10 or more purchases",
    flavor: "Double digits — you're committed!",
  },
  [BadgeType.ECO_HERO]: {
    label: "Eco Hero",
    icon: "🦸",
    desc: "Make 20 or more purchases",
    flavor: "A true champion for the environment.",
  },
  [BadgeType.HUNDRED_POINTS]: {
    label: "100 Eco-Coins",
    icon: "🪙",
    desc: "Earn 100 or more eco-coins",
    flavor: "Your eco-impact is leveling up!",
  },
};

export function getBadgeInfo(badge: BadgeType) {
  return BADGE_CRITERIA[badge] ?? { label: badge, icon: "🏅", desc: "", flavor: "" };
}

// ── Badge progress thresholds (for UI progress bars) ───────────────────────
export const BADGE_THRESHOLDS: Partial<Record<BadgeType, { field: "orders" | "ecoPoints"; target: number }>> = {
  [BadgeType.FIRST_PURCHASE]: { field: "orders",    target: 1  },
  [BadgeType.GREEN_BUYER]:    { field: "orders",    target: 5  },
  [BadgeType.TEN_PURCHASES]:  { field: "orders",    target: 10 },
  [BadgeType.ECO_HERO]:       { field: "orders",    target: 20 },
  [BadgeType.HUNDRED_POINTS]: { field: "ecoPoints", target: 100 },
};

// ── Eco-coins: +1 coin per 10 ₸ spent ─────────────────────────────────────
export const ECO_POINTS_PER_TENGE = 0.1; // 1 coin / 10 ₸

export function calcEcoPointsForPurchase(priceInTenge: number): number {
  return Math.floor(priceInTenge * ECO_POINTS_PER_TENGE);
}

// ── Award eco-points and check HUNDRED_POINTS badge ───────────────────────
export async function awardEcoPoints(userId: string, pointsToAdd: number) {
  if (pointsToAdd <= 0) return;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { ecoPoints: { increment: pointsToAdd } },
    select: { ecoPoints: true },
  });

  if (updated.ecoPoints >= 100) {
    await prisma.userBadge.upsert({
      where: { userId_badge: { userId, badge: BadgeType.HUNDRED_POINTS } },
      update: {},
      create: { userId, badge: BadgeType.HUNDRED_POINTS },
    });
  }
}

// ── Award purchase-count badges ────────────────────────────────────────────
export async function rewardPurchase(userId: string, ordersCount: number) {
  const badgesToAward: BadgeType[] = [];

  if (ordersCount >= 1)  badgesToAward.push(BadgeType.FIRST_PURCHASE);
  if (ordersCount >= 5)  badgesToAward.push(BadgeType.GREEN_BUYER);
  if (ordersCount >= 10) badgesToAward.push(BadgeType.TEN_PURCHASES);
  if (ordersCount >= 20) badgesToAward.push(BadgeType.ECO_HERO);

  for (const badge of badgesToAward) {
    await prisma.userBadge.upsert({
      where: { userId_badge: { userId, badge } },
      update: {},
      create: { userId, badge },
    });
  }
}
