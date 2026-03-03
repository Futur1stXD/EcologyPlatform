"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/toast";

interface Props {
  productId: string;
  title: string;
  price: number;
  image: string;
  isSeller: boolean;
}

export function AddToCartButton({ productId, title, price, image, isSeller }: Props) {
  const { addItem, items } = useCartStore();
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const inCart = mounted && items.some((i) => i.productId === productId);

  if (isSeller) return null;

  const handleAdd = () => {
    addItem({ productId, title, price, image });
    setAdded(true);
    toast.success("Added to cart", title);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      variant="outline"
      onClick={handleAdd}
      className={`flex items-center gap-2 transition-all ${
        inCart || added ? "border-green-500 text-green-600 bg-green-50" : ""
      }`}
    >
      {added || inCart ? (
        <>
          <Check size={16} /> In cart
        </>
      ) : (
        <>
          <ShoppingCart size={16} /> Add to cart
        </>
      )}
    </Button>
  );
}
