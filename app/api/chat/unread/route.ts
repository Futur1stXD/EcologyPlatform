import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/unread — total unread messages for current user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ count: 0 });

  // Find all rooms the user is a member of
  const rooms = await prisma.chatRoom.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    select: { id: true },
  });

  const roomIds = rooms.map((r) => r.id);

  const count = await prisma.message.count({
    where: {
      chatRoomId: { in: roomIds },
      senderId: { not: session.user.id },
      read: false,
    },
  });

  return NextResponse.json({ count });
}
