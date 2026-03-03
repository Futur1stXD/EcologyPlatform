import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rewardPurchase } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json() as { productId: string };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId, status: "APPROVED" },
      select: { id: true, title: true, price: true, sellerId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    }),
  ]);

  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  if (product.sellerId === session.user.id)
    return NextResponse.json({ error: "Нельзя купить собственный товар" }, { status: 400 });
  if (!user || user.balance < product.price)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

  const cashback = Math.round(product.price * 0.05 * 100) / 100;

  // Atomic transaction: deduct balance, create order, credit cashback
  const order = await prisma.$transaction(async (tx) => {
    // Deduct from balance
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        balance: { decrement: product.price },
        cashbackEarned: { increment: cashback },
      },
    });

    // Create order
    const o = await tx.order.create({
      data: {
        userId: session.user.id,
        totalPrice: product.price,
        paymentMethod: "BALANCE",
        cashbackAmount: cashback,
        items: { create: { productId, quantity: 1, price: product.price } },
      },
    });

    // Record purchase deduction
    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: -product.price,
        type: "PURCHASE",
        description: `Purchase: ${product.title}`,
        orderId: o.id,
      },
    });

    // Credit cashback (5%)
    await tx.user.update({
      where: { id: session.user.id },
      data: { balance: { increment: cashback } },
    });

    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: cashback,
        type: "CASHBACK",
        description: `5% cashback on: ${product.title}`,
        orderId: o.id,
      },
    });

    return o;
  });

  const ordersCount = await prisma.order.count({ where: { userId: session.user.id } });
  await rewardPurchase(session.user.id, ordersCount);

  return NextResponse.json({ ok: true, orderId: order.id, cashback });
}
