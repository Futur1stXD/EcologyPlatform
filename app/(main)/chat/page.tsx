import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-6">Сообщения</h1>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#6b6b6b] text-sm mb-2">Нет активных диалогов</p>
          <p className="text-xs text-[#a3a3a3]">Начните чат со страницы товара</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const other = room.buyerId === session.user.id ? room.seller : room.buyer;
            const lastMsg = room.messages[0];

            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e5e5] hover:border-[#a3a3a3] transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-[#0a0a0a] text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                  {other.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-[#0a0a0a]">{other.name}</p>
                    {lastMsg && (
                      <p className="text-xs text-[#a3a3a3]">{formatDate(lastMsg.createdAt)}</p>
                    )}
                  </div>
                  {lastMsg ? (
                    <p className="text-sm text-[#6b6b6b] truncate">{lastMsg.content}</p>
                  ) : (
                    <p className="text-xs text-[#a3a3a3]">Нет сообщений</p>
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
