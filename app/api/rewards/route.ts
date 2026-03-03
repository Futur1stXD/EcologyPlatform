import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBadgeInfo } from "@/lib/gamification";
import { BadgeType } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ecoPoints: true,
      badges: { orderBy: { awardedAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

  const badges = user.badges.map((b: { badge: string; awardedAt: Date }) => ({
    ...b,
    info: getBadgeInfo(b.badge as BadgeType),
  }));

  return NextResponse.json({ ecoPoints: user.ecoPoints, badges, ordersCount: user._count.orders });
}
