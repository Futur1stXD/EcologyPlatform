import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json() as { items: CartItemInput[] };
  if (!items?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

  // Fetch all products to validate + get real prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "APPROVED" },
    select: { id: true, title: true, price: true, images: true, sellerId: true },
  });

  if (products.length !== items.length) {
    return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 });
  }

  const ownedProduct = products.find((p) => p.sellerId === session.user.id);
  if (ownedProduct) {
    return NextResponse.json(
      { error: `Нельзя купить собственный товар: "${ownedProduct.title}"` },
      { status: 400 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    // Only pass valid HTTPS image URLs to Stripe
    const stripeImages = product.images
      .filter((url) => url.startsWith("https://"))
      .slice(0, 1);
    return {
      quantity: item.quantity,
      price_data: {
        currency: "kzt",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.title,
          images: stripeImages,
        },
      },
    };
  });

  // Store cart items in metadata for webhook/verify
  const cartItemsMeta = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: productMap.get(item.productId)!.price,
  }));

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId: session.user.id,
        type: "cart_purchase",
        cartItems: JSON.stringify(cartItemsMeta),
      },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[cart-checkout]:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
