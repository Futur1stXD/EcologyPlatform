import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Preset top-up amounts in KZT
const TOPUP_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json() as { amount: number };
  if (!amount || !TOPUP_AMOUNTS.includes(amount)) {
    return NextResponse.json(
      { error: `Invalid amount. Choose one of: ${TOPUP_AMOUNTS.join(", ")} ₸` },
      { status: 400 }
    );
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "kzt",
            unit_amount: amount * 100, // Stripe uses smallest currency unit
            product_data: {
              name: `Balance top-up — ${amount.toLocaleString("ru-KZ")} ₸`,
              description: "Top up your EcoMarket balance",
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?topup=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?topup=canceled`,
      metadata: {
        userId: session.user.id,
        type: "balance_topup",
        amount: String(amount),
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[balance-topup]:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
