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

  const { items } = await req.json() as { items: CartItemInput[] };
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
    select: { balance: true },
  });

  if (!user || user.balance < totalPrice)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });

  const cashback = Math.round(totalPrice * 0.05 * 100) / 100;

  const order = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        balance: { decrement: totalPrice },
        cashbackEarned: { increment: cashback },
      },
    });

    const o = await tx.order.create({
      data: {
        userId: session.user.id,
        totalPrice,
        paymentMethod: "BALANCE",
        cashbackAmount: cashback,
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
        amount: -totalPrice,
        type: "PURCHASE",
        description: `Cart purchase (${items.length} item${items.length > 1 ? "s" : ""})`,
        orderId: o.id,
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { balance: { increment: cashback } },
    });

    await tx.balanceTransaction.create({
      data: {
        userId: session.user.id,
        amount: cashback,
        type: "CASHBACK",
        description: `5% cashback on cart purchase`,
        orderId: o.id,
      },
    });

    return o;
  });

  const ordersCount = await prisma.order.count({ where: { userId: session.user.id } });
  await rewardPurchase(session.user.id, ordersCount);

  return NextResponse.json({ ok: true, orderId: order.id, cashback });
}
