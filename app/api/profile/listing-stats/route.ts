import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const FREE_PLAN_LIMIT = 10;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [productCount, subscription] = await Promise.all([
    prisma.product.count({ where: { sellerId: session.user.id } }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, currentPeriodEnd: true },
    }),
  ]);

  const plan = subscription?.plan ?? "FREE";
  const limit = plan === "PREMIUM" ? null : FREE_PLAN_LIMIT;
  const remaining = limit !== null ? Math.max(0, limit - productCount) : null;

  return NextResponse.json({
    productCount,
    plan,
    limit,
    remaining,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  });
}
