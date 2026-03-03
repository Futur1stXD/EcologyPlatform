import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          subscription: { select: { plan: true, currentPeriodEnd: true } },
        },
      },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(product);
}

// PATCH /api/products/[id] — update (seller or admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const isOwner = product.sellerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const body = await req.json();

  // Explicitly map only known Product fields to avoid Prisma unknown-field errors
  const updateData: Record<string, unknown> = {};
  const allowed = [
    "title", "description", "price", "images", "category", "materials",
    "origin", "ecoScore", "status", "isFeatured", "packagingType",
    "hasRecycling", "hasOrganicCert", "isFairTrade", "isVegan",
    "isLocalDelivery", "hasCarbonNeutral", "hasEnergyEfficiency",
    "hasZeroWaste", "isDurable",
  ];
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key];
  }

  const updated = await prisma.product.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}

// DELETE /api/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const isOwner = product.sellerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
