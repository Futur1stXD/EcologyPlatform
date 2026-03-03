import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatLastTime(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
}

export default async function ChatListPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
    },
    include: {
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: {
            where: { senderId: { not: session.user.id }, read: false },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-6">Messages</h1>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#6b6b6b] text-sm mb-2">No active conversations</p>
          <p className="text-xs text-[#a3a3a3]">Start a chat from a product page</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const other = room.buyerId === session.user.id ? room.seller : room.buyer;
            const lastMsg = room.messages[0];
            const unread = room._count.messages;

            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  unread > 0
                    ? "border-[#0a0a0a] bg-[#fafafa]"
                    : "border-[#e5e5e5] hover:border-[#a3a3a3]"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-[#0a0a0a] text-white text-sm font-medium flex items-center justify-center">
                    {other.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${unread > 0 ? "font-semibold text-[#0a0a0a]" : "font-medium text-[#0a0a0a]"}`}>
                      {other.name}
                    </p>
                    {lastMsg && (
                      <p className={`text-xs flex-shrink-0 ${unread > 0 ? "text-[#0a0a0a] font-medium" : "text-[#a3a3a3]"}`}>
                        {formatLastTime(lastMsg.createdAt)}
                      </p>
                    )}
                  </div>
                  {lastMsg ? (
                    <p className={`text-sm truncate ${unread > 0 ? "text-[#0a0a0a] font-medium" : "text-[#6b6b6b]"}`}>
                      {lastMsg.senderId === session.user.id ? "You: " : ""}{lastMsg.content}
                    </p>
                  ) : (
                    <p className="text-xs text-[#a3a3a3]">No messages</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
