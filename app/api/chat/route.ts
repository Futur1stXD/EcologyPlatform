import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat — list current user's chat rooms
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
    },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rooms);
}

// POST /api/chat — create or get a chat room
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sellerId, productId } = await req.json();

  if (sellerId === session.user.id) {
    return NextResponse.json({ error: "Нельзя писать себе" }, { status: 400 });
  }

  const room = await prisma.chatRoom.upsert({
    where: { buyerId_sellerId: { buyerId: session.user.id, sellerId } },
    update: { productId: productId ?? null },
    create: { buyerId: session.user.id, sellerId, productId: productId ?? null },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(room);
}
