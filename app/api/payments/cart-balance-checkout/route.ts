import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rewardPurchase } from "@/lib/gamification";

interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, useCashback, useEcoPoints } = await req.json() as { items: CartItemInput[]; useCashback?: boolean; useEcoPoints?: boolean };
  if (!items?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "APPROVED" },
    select: { id: true, title: true, price: true, sellerId: true },
  });

  if (products.length !== items.length)
    return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 });

  const ownedProduct = products.find((p) => p.sellerId === session.user.id);
  if (ownedProduct)
    return NextResponse.json({ error: `Нельзя купить собственный товар: "${ownedProduct.title}"` }, { status: 400 });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const totalPrice = items.reduce((sum, item) => {
    return sum + productMap.get(item.productId)!.price * item.quantity;
  }, 0);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true, cashbackBalance: true, ecoPoints: true },
  });

  // Calculate cashback discount applied
  const cashbackApplied = useCashback && user && user.cashbackBalance > 0
    ? Math.min(user.cashbackBalance, totalPrice)
    : 0;
  const cashbackAppliedRounded = Math.round(cashbackApplied * 100) / 100;

  // Calculate eco-points discount (1 point = 1 ₸), applied after cashback
  const priceAfterCashback = Math.round((totalPrice - cashbackAppliedRounded) * 100) / 100;
  const ecoPointsApplied = useEcoPoints && user && user.ecoPoints > 0
    ? Math.min(user.ecoPoints, priceAfterCashback)
    : 0;
  const ecoPointsAppliedRounded = Math.round(ecoPointsApplied * 100) / 100;

  const effectivePrice = Math.round((priceAfterCashback - ecoPointsAppliedRounded) * 100) / 100;

  if (!user || user.balance < effectivePrice)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

  const cashbackEarned = Math.round(totalPrice * 0.05 * 100) / 100;

  const order = await prisma.$transaction(async (tx) => {
    const userUpdate: Record<string, unknown> = {
      balance: { decrement: effectivePrice },
      cashbackEarned: { increment: cashbackEarned },
      cashbackBalance: { increment: cashbackEarned },
    };
    if (cashbackAppliedRounded > 0) {
      userUpdate.cashbackBalance = {
        increment: cashbackEarned - cashbackAppliedRounded,
      };
    }
    if (ecoPointsAppliedRounded > 0) {
      userUpdate.ecoPoints = { decrement: Math.round(ecoPointsAppliedRounded) };
    }

    await tx.user.update({ where: { id: session.user.id }, data: userUpdate });

    const o = await tx.order.create({
      data: {
        userId: session.user.id,
        totalPrice,
        paymentMethod: "BALANCE",
        cashbackAmount: cashbackEarned,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
    });

    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: -effectivePrice,
        type: "PURCHASE",
        description: cashbackAppliedRounded > 0
          ? `Cart purchase (${items.length} item${items.length > 1 ? "s" : ""}) — ${cashbackAppliedRounded.toLocaleString("ru-KZ")} ₸ cashback applied`
          : `Cart purchase (${items.length} item${items.length > 1 ? "s" : ""})`,
        orderId: o.id,
      },
    });

    if (cashbackAppliedRounded > 0) {
      await tx.balanceTransaction.create({
        data: {
          userId: session.user.id,
          amount: -cashbackAppliedRounded,
          type: "CASHBACK_SPEND",
          description: `Cashback spent on cart purchase`,
          orderId: o.id,
        },
      });
    }

    if (ecoPointsAppliedRounded > 0) {
      await tx.balanceTransaction.create({
        data: {
          userId: session.user.id,
          amount: -ecoPointsAppliedRounded,
          type: "ECO_SPEND",
          description: `${Math.round(ecoPointsAppliedRounded)} eco-pts spent on cart purchase`,
          orderId: o.id,
        },
      });
    }

    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: cashbackEarned,
        type: "CASHBACK",
        description: `5% cashback on cart purchase`,
        orderId: o.id,
      },
    });

    return o;
  });

  const ordersCount = await prisma.order.count({ where: { userId: session.user.id } });
  await rewardPurchase(session.user.id, ordersCount);

  return NextResponse.json({ ok: true, orderId: order.id, cashback: cashbackEarned, cashbackApplied: cashbackAppliedRounded, ecoPointsApplied: ecoPointsAppliedRounded });
}
