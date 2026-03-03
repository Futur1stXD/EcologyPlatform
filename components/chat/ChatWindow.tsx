"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, CheckCheck } from "lucide-react";
import type { MessageSummary } from "@/types";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Сегодня";
  if (d.toDateString() === yesterday.toDateString()) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function isSameDay(a: Date | string, b: Date | string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds
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

    // Optimistic update
    const optimistic: MessageSummary = {
      id: `tmp-${Date.now()}`,
      content: input.trim(),
      senderId: session?.user?.id ?? "",
      createdAt: new Date(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    const text = input.trim();
    setInput("");

    const res = await fetch(`/api/chat/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? newMsg : m)));
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessages = () => {
    const result: React.ReactNode[] = [];
    messages.forEach((msg, i) => {
      const isOwn = msg.senderId === session?.user?.id;
      const prevMsg = messages[i - 1];
      const isOptimistic = msg.id.startsWith("tmp-");
      const showSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
      const showSenderInfo = !prevMsg || prevMsg.senderId !== msg.senderId || showSeparator;

      if (showSeparator) {
        result.push(
          <div key={`sep-${msg.id}`} className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#e5e5e5]" />
            <span className="text-[11px] text-[#a3a3a3] font-medium px-2 select-none">
              {formatDateSeparator(msg.createdAt)}
            </span>
            <div className="flex-1 h-px bg-[#e5e5e5]" />
          </div>
        );
      }

      result.push(
        <div
          key={msg.id}
          className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"} ${showSenderInfo ? "mt-3" : "mt-0.5"}`}
        >
          {/* Avatar for other user */}
          {!isOwn && (
            <div className={`flex-shrink-0 mt-auto ${showSenderInfo ? "visible" : "invisible"}`}>
              <div className="h-7 w-7 rounded-full bg-[#e5e5e5] text-[#0a0a0a] text-xs font-semibold flex items-center justify-center border border-[#d4d4d4]">
                {otherUser.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            </div>
          )}

          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
            {showSenderInfo && (
              <span className="text-[11px] font-medium text-[#a3a3a3] mb-1 px-1">
                {isOwn ? "Вы" : (otherUser.name ?? "Пользователь")}
              </span>
            )}
            <div
              className={`px-3.5 py-2 rounded-2xl ${
                isOwn
                  ? "bg-[#0a0a0a] text-white rounded-br-sm shadow-sm"
                  : "bg-white text-[#0a0a0a] rounded-bl-sm border border-[#e5e5e5] shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
              <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                <span className={`text-[10px] ${isOwn ? "text-white/50" : "text-[#b0b0b0]"}`}>
                  {formatTime(msg.createdAt)}
                </span>
                {isOwn && !isOptimistic && (
                  <CheckCheck size={11} className={msg.read ? "text-blue-400" : "text-white/40"} />
                )}
                {isOwn && isOptimistic && (
                  <span className="text-[10px] text-white/30">•••</span>
                )}
              </div>
            </div>
          </div>

          {isOwn && <div className="w-7 flex-shrink-0" />}
        </div>
      );
    });
    return result;
  };

  return (
    <div className="flex flex-col h-full bg-[#f7f7f7]">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] bg-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-[#0a0a0a] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
          {otherUser.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0a0a0a]">{otherUser.name ?? "Пользователь"}</p>
          <p className="text-xs text-[#a3a3a3]">Участник чата</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="h-12 w-12 rounded-full bg-[#e5e5e5] flex items-center justify-center text-xl">💬</div>
            <p className="text-sm font-medium text-[#0a0a0a]">Начните диалог</p>
            <p className="text-xs text-[#a3a3a3]">Напишите первое сообщение</p>
          </div>
        )}
        {renderMessages()}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e5e5e5] bg-white p-3 flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          className="flex-1 h-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3.5 text-sm outline-none focus:border-[#0a0a0a] focus:bg-white transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="h-10 w-10 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#1a1a1a] active:scale-95 transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
