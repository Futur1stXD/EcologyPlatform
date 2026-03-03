import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      // ── Balance top-up ─────────────────────────────────────────────────
      if (session.metadata?.type === "balance_topup") {
        const amount = parseFloat(session.metadata.amount ?? "0");
        if (!amount) break;

        // Idempotency: skip if already processed
        const existing = await prisma.balanceTransaction.findFirst({
          where: { description: { contains: session.id } },
        });
        if (existing) break;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: amount } },
          }),
          prisma.balanceTransaction.create({
            data: {
              userId,
              amount,
              type: "TOPUP",
              description: `Balance top-up via Stripe [${session.id}]`,
            },
          }),
        ]);

        // Award eco-points for top-up (1 pt per 100 ₸)
        const { rewardTopup } = await import("@/lib/gamification");
        await rewardTopup(userId, amount);
        break;
      }

      // ── Single product purchase ─────────────────────────────────────────
      if (session.metadata?.type === "product_purchase") {
        const productId = session.metadata.productId;
        if (!productId) break;

        // Idempotency via stripeSessionId
        const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
        if (existing) break;

        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { price: true, title: true },
        });
        if (!product) break;

        const cashback = Math.round(product.price * 0.05 * 100) / 100;

        const order = await prisma.order.create({
          data: {
            userId,
            totalPrice: product.price,
            stripeSessionId: session.id,
            paymentMethod: "STRIPE",
            cashbackAmount: cashback,
            items: { create: { productId, quantity: 1, price: product.price } },
          },
        });

        // 5% cashback
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              balance: { increment: cashback },
              cashbackEarned: { increment: cashback },
            },
          }),
          prisma.balanceTransaction.create({
            data: {
              userId,
              amount: cashback,
              type: "CASHBACK",
              description: `5% cashback on: ${product.title}`,
              orderId: order.id,
            },
          }),
        ]);

        const ordersCount = await prisma.order.count({ where: { userId } });
        const { rewardPurchase } = await import("@/lib/gamification");
        await rewardPurchase(userId, ordersCount);
        break;
      }

      // ── Premium subscription ────────────────────────────────────────────
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = new Date((sub.items.data[0]?.current_period_end ?? 0) * 1000);
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: "PREMIUM",
            stripeSubId: sub.id,
            currentPeriodEnd: periodEnd,
          },
          create: {
            userId,
            plan: "PREMIUM",
            stripeCustomerId: session.customer as string,
            stripeSubId: sub.id,
            currentPeriodEnd: periodEnd,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { plan: "FREE", stripeSubId: null, currentPeriodEnd: null },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription: string }).subscription;
      if (!subId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subId);
      await prisma.subscription.updateMany({
        where: { stripeSubId: subId },
        data: {
          currentPeriodEnd: new Date((stripeSub.items.data[0]?.current_period_end ?? 0) * 1000),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
