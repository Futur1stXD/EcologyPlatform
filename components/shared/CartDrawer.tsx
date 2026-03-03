"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart, Leaf } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();

  // Avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-semibold text-[#0a0a0a]">Cart</span>
            {totalItems() > 0 && (
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white font-medium">
                {totalItems()}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 hover:bg-[#f5f5f5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="p-4 rounded-full bg-[#f5f5f5]">
                <Leaf size={28} className="text-green-400" />
              </div>
              <p className="font-medium text-[#0a0a0a]">Your cart is empty</p>
              <p className="text-sm text-[#6b6b6b]">Add eco-friendly products</p>
              <Button size="sm" onClick={closeCart}>
                <Link href="/products">Browse catalogue</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 p-3 rounded-xl border border-[#e5e5e5]"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.productId}`}
                  onClick={closeCart}
                  className="shrink-0"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded-lg object-cover bg-[#f5f5f5]"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                      <Leaf size={20} className="text-gray-300" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-[#0a0a0a] hover:underline line-clamp-2 leading-snug"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded-md border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded-md border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-xs text-[#a3a3a3] hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e5e5e5] px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b6b6b]">Total ({totalItems()} item{totalItems() !== 1 ? "s" : ""})</span>
              <span className="font-bold text-lg text-[#0a0a0a]">{formatPrice(totalPrice())}</span>
            </div>
            <Link href="/cart" onClick={closeCart}>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
