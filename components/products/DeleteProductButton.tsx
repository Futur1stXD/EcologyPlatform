"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/toast";

interface DeleteProductButtonProps {
  productId: string;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Удалить этот товар? Это действие нельзя отменить.")) return;
    setLoading(true);
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Товар удалён");
      router.push("/products");
    } else {
      toast.error("Ошибка", "Не удалось удалить товар");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="danger"
      className="w-full flex items-center gap-2"
      loading={loading}
      onClick={handleDelete}
    >
      <Trash2 size={15} /> Удалить товар
    </Button>
  );
}
