import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rewardPurchase, awardEcoPoints, calcEcoPointsForPurchase } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, useCashback, useEcoPoints } = await req.json() as {
    productId: string;
    useCashback?: boolean;
    useEcoPoints?: boolean;
  };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId, status: "APPROVED" },
      select: { id: true, title: true, price: true, sellerId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true, cashbackBalance: true, ecoPoints: true },
    }),
  ]);

  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  if (product.sellerId === session.user.id)
    return NextResponse.json({ error: "Нельзя купить собственный товар" }, { status: 400 });

  // Calculate cashback discount applied
  const cashbackApplied = useCashback && user && user.cashbackBalance > 0
    ? Math.min(user.cashbackBalance, product.price)
    : 0;
  const cashbackAppliedRounded = Math.round(cashbackApplied * 100) / 100;
  const priceAfterCashback = Math.round((product.price - cashbackAppliedRounded) * 100) / 100;

  // Calculate eco-points discount applied (1 pt = 1 ₸)
  const ecoPointsApplied = useEcoPoints && user && user.ecoPoints > 0
    ? Math.min(user.ecoPoints, priceAfterCashback)
    : 0;
  const ecoPointsAppliedRounded = Math.round(ecoPointsApplied);

  const effectivePrice = Math.round((priceAfterCashback - ecoPointsAppliedRounded) * 100) / 100;

  if (!user || user.balance < effectivePrice)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

  const cashbackEarned = Math.round(product.price * 0.05 * 100) / 100;

  // Atomic transaction: deduct balance, optionally spend cashback/eco-points, create order, credit new cashback
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
      userUpdate.ecoPoints = { decrement: ecoPointsAppliedRounded };
    }

    await tx.user.update({ where: { id: session.user.id }, data: userUpdate });

    const descParts: string[] = [`Purchase: ${product.title}`];
    if (cashbackAppliedRounded > 0) descParts.push(`${cashbackAppliedRounded.toLocaleString("ru-KZ")} ₸ cashback applied`);
    if (ecoPointsAppliedRounded > 0) descParts.push(`${ecoPointsAppliedRounded} eco-coins applied`);

    const o = await tx.order.create({
      data: {
        userId: session.user.id,
        totalPrice: product.price,
        paymentMethod: "BALANCE",
        cashbackAmount: cashbackEarned,
        items: { create: { productId, quantity: 1, price: product.price } },
      },
    });

    // Record purchase deduction
    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: -effectivePrice,
        type: "PURCHASE",
        description: descParts.join(" · "),
        orderId: o.id,
      },
    });

    // Record cashback spend
    if (cashbackAppliedRounded > 0) {
      await tx.balanceTransaction.create({
        data: {
          userId: session.user.id,
          amount: -cashbackAppliedRounded,
          type: "CASHBACK_SPEND",
          description: `Cashback spent on: ${product.title}`,
          orderId: o.id,
        },
      });
    }

    // Record eco-coins spend
    if (ecoPointsAppliedRounded > 0) {
      await tx.balanceTransaction.create({
        data: {
          userId: session.user.id,
          amount: -ecoPointsAppliedRounded,
          type: "ECO_SPEND",
          description: `Eco-coins spent on: ${product.title}`,
          orderId: o.id,
        },
      });
    }

    // Credit new cashback (5%) to cashbackBalance
    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: cashbackEarned,
        type: "CASHBACK",
        description: `5% cashback on: ${product.title}`,
        orderId: o.id,
      },
    });

    return o;
  });

  // Award purchase-count badges
  const ordersCount = await prisma.order.count({ where: { userId: session.user.id } });
  await rewardPurchase(session.user.id, ordersCount);

  // Award eco-points for this purchase (1 coin per 10 ₸)
  const ecoPointsEarned = calcEcoPointsForPurchase(product.price);
  await awardEcoPoints(session.user.id, ecoPointsEarned);

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    cashback: cashbackEarned,
    cashbackApplied: cashbackAppliedRounded,
    ecoPointsApplied: ecoPointsAppliedRounded,
    ecoPointsEarned,
  });
}
