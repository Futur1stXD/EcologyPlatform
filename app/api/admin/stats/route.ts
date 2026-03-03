import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalProducts,
    pendingProducts,
    totalOrders,
    orders,
    premiumSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.subscription.count({ where: { plan: "PREMIUM" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue: orders._sum.totalPrice ?? 0,
    premiumSubscriptions,
  });
}
