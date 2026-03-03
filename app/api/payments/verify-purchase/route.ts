import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rewardPurchase } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json() as { sessionId: string };
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  // Idempotency: if order already exists for this Stripe session, just return success
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } });
  if (existing) return NextResponse.json({ ok: true, orderId: existing.id });

  // Verify with Stripe that the payment is actually paid
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  if (stripeSession.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  const userId = stripeSession.metadata?.userId;
  const productId = stripeSession.metadata?.productId;
  const type = stripeSession.metadata?.type;

  if (!userId || userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (type === "product_purchase" && productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice: product.price,
        stripeSessionId: sessionId,
        items: { create: { productId, quantity: 1, price: product.price } },
      },
    });

    const ordersCount = await prisma.order.count({ where: { userId } });
    await rewardPurchase(userId, ordersCount);

    return NextResponse.json({ ok: true, orderId: order.id });
  }

  if (type === "cart_purchase") {
    // Cart items are stored in metadata as JSON
    const cartJson = stripeSession.metadata?.cartItems;
    if (!cartJson) return NextResponse.json({ error: "No cart items" }, { status: 400 });

    const cartItems = JSON.parse(cartJson) as { productId: string; price: number; quantity: number }[];
    const totalPrice = stripeSession.amount_total ? stripeSession.amount_total / 100 : 0;

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        stripeSessionId: sessionId,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const ordersCount = await prisma.order.count({ where: { userId } });
    await rewardPurchase(userId, ordersCount);

    return NextResponse.json({ ok: true, orderId: order.id });
  }

  return NextResponse.json({ error: "Unknown purchase type" }, { status: 400 });
}
