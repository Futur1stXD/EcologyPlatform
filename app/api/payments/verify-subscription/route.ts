import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json() as { sessionId: string };
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  // Verify with Stripe that the payment completed
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  if (stripeSession.payment_status !== "paid" && stripeSession.status !== "complete") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  const userId = stripeSession.metadata?.userId;
  if (!userId || userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Idempotency — if sub already activated, just return it
  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, currentPeriodEnd: true, stripeSubId: true },
  });
  if (existingSub?.plan === "PREMIUM" && existingSub.stripeSubId) {
    return NextResponse.json({ ok: true, plan: "PREMIUM", currentPeriodEnd: existingSub.currentPeriodEnd });
  }

  // Retrieve the subscription from Stripe
  if (!stripeSession.subscription) {
    return NextResponse.json({ error: "No subscription in session" }, { status: 400 });
  }

  const sub = await stripe.subscriptions.retrieve(stripeSession.subscription as string);
  const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: "PREMIUM",
      stripeSubId: sub.id,
      currentPeriodEnd: periodEnd,
      stripeCustomerId: stripeSession.customer as string,
    },
    create: {
      userId,
      plan: "PREMIUM",
      stripeCustomerId: stripeSession.customer as string,
      stripeSubId: sub.id,
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ ok: true, plan: "PREMIUM", currentPeriodEnd: periodEnd });
}
