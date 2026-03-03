"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/toast";

interface DeleteProductButtonProps {
  productId: string;
  redirectTo?: string;
  compact?: boolean;
}

export function DeleteProductButton({ productId, redirectTo = "/products", compact = false }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      router.push(redirectTo);
      router.refresh();
    } else {
      toast.error("Error", "Could not delete the product");
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        disabled={loading}
        onClick={handleDelete}
        className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2 py-0.5 disabled:opacity-50"
      >
        {loading ? "…" : "Delete"}
      </button>
    );
  }

  return (
    <Button
      variant="danger"
      className="w-full flex items-center gap-2"
      loading={loading}
      onClick={handleDelete}
    >
      <Trash2 size={15} /> Delete product
    </Button>
  );
}
