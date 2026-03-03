import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true, plan: true },
    });

    if (!sub?.stripeCustomerId || sub.plan !== "PREMIUM") {
      return NextResponse.json({ invoices: [] });
    }

    const result = await stripe.invoices.list({
      customer: sub.stripeCustomerId,
      limit: 12,
    });

    const invoices = result.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: inv.amount_paid / 100,
      currency: inv.currency,
      created: inv.created,
      pdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
      periodStart: (inv as unknown as { period_start: number }).period_start,
      periodEnd: (inv as unknown as { period_end: number }).period_end,
    }));

    return NextResponse.json({ invoices });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[invoices]:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
