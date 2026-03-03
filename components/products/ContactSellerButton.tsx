"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/toast";

interface ContactSellerButtonProps {
  sellerId: string;
  productId: string;
}

export function ContactSellerButton({ sellerId, productId }: ContactSellerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId, productId }),
    });

    if (res.ok) {
      const room = await res.json();
      router.push(`/chat/${room.id}`);
    } else {
      toast.error("Could not start chat", "Please try again.");
    }
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={startChat} loading={loading}>
      <MessageCircle size={14} className="mr-1.5" />
      Message
    </Button>
  );
}
