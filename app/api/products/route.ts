import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  images: z.array(z.string()).default([]),
  category: z.string(),
  materials: z.array(z.string()).default([]),
  origin: z.string(),
  ecoScore: z.number().min(1).max(100),
  packagingType: z.string().optional().default(""),
  hasRecycling: z.boolean().optional().default(false),
  hasOrganicCert: z.boolean().optional().default(false),
  isFairTrade: z.boolean().optional().default(false),
  isVegan: z.boolean().optional().default(false),
  isLocalDelivery: z.boolean().optional().default(false),
  hasCarbonNeutral: z.boolean().optional().default(false),
  hasEnergyEfficiency: z.boolean().optional().default(false),
  hasZeroWaste: z.boolean().optional().default(false),
  isDurable: z.boolean().optional().default(false),
  certificateUrl: z.string().optional().nullable(),
});

// GET /api/products — list with filtering
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minEcoScore = searchParams.get("minEcoScore");
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;

  const where = {
    status: "APPROVED" as const,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(minEcoScore && { ecoScore: { gte: parseInt(minEcoScore) } }),
  };

  const orderBy = {
    newest: { createdAt: "desc" as const },
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    eco_score: { ecoScore: "desc" as const },
  }[sort] ?? { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: {
          select: { id: true, name: true, image: true, subscription: { select: { plan: true, currentPeriodEnd: true } } },
        },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) });
}

const FREE_PLAN_LIMIT = 10;

// POST /api/products — create
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "USER") {
    return NextResponse.json({ error: "Only sellers can publish products." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    // Enforce free plan limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    const plan = subscription?.plan ?? "FREE";

    if (plan === "FREE") {
      const productCount = await prisma.product.count({
        where: { sellerId: session.user.id },
      });
      if (productCount >= FREE_PLAN_LIMIT) {
        return NextResponse.json(
          { error: `Free plan limit reached (${FREE_PLAN_LIMIT} listings). Upgrade to Premium for unlimited listings.` },
          { status: 403 }
        );
      }
    }

    const product = await prisma.product.create({
      data: { ...data, sellerId: session.user.id, status: "PENDING" },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
