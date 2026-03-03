import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/chat/[id]/messages — fetch messages for a room
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const room = await prisma.chatRoom.findUnique({ where: { id } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const isMember = room.buyerId === session.user.id || room.sellerId === session.user.id;
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const messages = await prisma.message.findMany({
      where: { chatRoomId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark incoming messages as read
    await prisma.message.updateMany({
      where: { chatRoomId: id, senderId: { not: session.user.id }, read: false },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[chat/messages GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({ where: { id } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const isMember = room.buyerId === session.user.id || room.sellerId === session.user.id;
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { content: content.trim(), chatRoomId: id, senderId: session.user.id },
      }),
      prisma.chatRoom.update({ where: { id }, data: { updatedAt: new Date() } }),
    ]);

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[chat/messages POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
