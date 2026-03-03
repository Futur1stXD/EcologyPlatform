import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PREMIUM_PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!PREMIUM_PRICE_ID) {
    console.error("[create-checkout]: STRIPE_PREMIUM_PRICE_ID is not configured");
    return NextResponse.json({ error: "Subscription not available. Contact support." }, { status: 503 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: { stripeCustomerId: customerId },
        create: { userId: session.user.id, stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: { userId: session.user.id },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[create-checkout]:", err);
    return NextResponse.json({ error: "Stripe unavailable. Please try again later." }, { status: 502 });
  }
}
