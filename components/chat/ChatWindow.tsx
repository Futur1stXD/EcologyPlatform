"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { MessageSummary } from "@/types";

interface ChatWindowProps {
  roomId: string;
  initialMessages: MessageSummary[];
  otherUser: { id: string; name: string | null; image: string | null };
}

export function ChatWindow({ roomId, initialMessages, otherUser }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageSummary[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds (simple polling, can be replaced with WebSocket)
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/chat/${roomId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const res = await fetch(`/api/chat/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white text-xs font-medium flex items-center justify-center">
          {otherUser.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <span className="text-sm font-medium text-[#0a0a0a]">{otherUser.name ?? "Пользователь"}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#a3a3a3] py-10">Начните диалог</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-[#0a0a0a] text-white rounded-br-sm"
                    : "bg-[#f5f5f5] text-[#0a0a0a] rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/50" : "text-[#a3a3a3]"}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e5e5e5] p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          className="flex-1 h-10 rounded-lg border border-[#e5e5e5] px-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="h-10 w-10 rounded-lg bg-[#0a0a0a] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#1a1a1a] transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
