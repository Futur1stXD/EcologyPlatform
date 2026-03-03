"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatPrice } from "@/lib/utils";
import { toast } from "@/lib/store/toast";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  ecoScore: number;
  status: string;
  createdAt: Date;
  seller: { name: string | null; email: string };
  _count: { reviews: number };
}

interface AdminProductsTableProps {
  products: Product[];
}

export function AdminProductsTable({ products: initial }: AdminProductsTableProps) {
  const [products, setProducts] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const moderate = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoading(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      toast.success(
        status === "APPROVED" ? "Product approved" : "Product rejected",
        status === "APPROVED" ? "The listing is now visible in the catalogue" : "The seller will be notified"
      );
    } else {
      toast.error("Action failed", "Could not update product status");
    }
    setLoading(null);
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    setLoading(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: !isFeatured } : p))
      );
      toast.success(isFeatured ? "Removed from featured" : "Marked as featured");
    } else {
      toast.error("Action failed");
    }
    setLoading(null);
  };

  return (
    <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-[#e5e5e5] bg-[#fafafa]">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Product</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Seller</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Eco</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Price</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Date</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-[#6b6b6b]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e5e5]">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-[#fafafa]">
              <td className="px-4 py-3">
                <p className="font-medium text-[#0a0a0a] max-w-[180px] truncate">{p.title}</p>
                <p className="text-xs text-[#a3a3a3]">{p.category}</p>
              </td>
              <td className="px-4 py-3 text-[#6b6b6b]">{p.seller.name}</td>
              <td className="px-4 py-3 font-medium text-[#0a0a0a]">{p.ecoScore}</td>
              <td className="px-4 py-3 text-[#0a0a0a]">{formatPrice(p.price)}</td>
              <td className="px-4 py-3">
                <Badge
                  variant={
                    p.status === "APPROVED" ? "green" : p.status === "REJECTED" ? "red" : "yellow"
                  }
                >
                  {p.status === "APPROVED" ? "Approved" : p.status === "REJECTED" ? "Rejected" : "Pending"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-[#6b6b6b]">{formatDate(p.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  {p.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        loading={loading === p.id}
                        onClick={() => moderate(p.id, "APPROVED")}
                      >
                        ✓
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        loading={loading === p.id}
                        onClick={() => moderate(p.id, "REJECTED")}
                      >
                        ✗
                      </Button>
                    </>
                  )}
                  <a
                    href={`/products/${p.id}`}
                    target="_blank"
                    className="text-xs text-[#6b6b6b] hover:text-[#0a0a0a]"
                  >
                    ↗
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
