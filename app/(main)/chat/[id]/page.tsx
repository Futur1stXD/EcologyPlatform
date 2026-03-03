import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/chat/ChatWindow";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const room = await prisma.chatRoom.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!room) notFound();

  const isMember = room.buyerId === session.user.id || room.sellerId === session.user.id;
  if (!isMember) redirect("/chat");

  const otherUser = room.buyerId === session.user.id ? room.seller : room.buyer;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      <Link href="/chat" className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] mb-4 transition-colors">
        <ArrowLeft size={14} />
        All messages
      </Link>

      <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden h-[600px]">
        <ChatWindow
          roomId={room.id}
          initialMessages={room.messages}
          otherUser={otherUser}
        />
      </div>
    </div>
  );
}
