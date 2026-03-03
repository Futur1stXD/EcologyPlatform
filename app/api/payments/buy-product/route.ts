import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
    select: { id: true, title: true, price: true, images: true, sellerId: true },
  });

  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  if (product.sellerId === session.user.id)
    return NextResponse.json({ error: "Нельзя купить собственный товар" }, { status: 400 });

  try {
    // Only pass valid HTTPS image URLs to Stripe (relative paths cause session creation to fail)
    const stripeImages = product.images
      .filter((url) => url.startsWith("https://"))
      .slice(0, 1);

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "kzt",
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.title,
              images: stripeImages,
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${productId}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${productId}`,
      metadata: {
        userId: session.user.id,
        productId: product.id,
        type: "product_purchase",
      },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[buy-product]:", err);
    return NextResponse.json({ error: "Stripe unavailable. Please try again later." }, { status: 502 });
  }
}
