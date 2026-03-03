"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/store/toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  subscription: { plan: string } | null;
  _count: { products: number; orders: number };
}

interface AdminUsersTableProps {
  users: User[];
}

export function AdminUsersTable({ users: initial }: AdminUsersTableProps) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleBan = async (id: string, banned: boolean) => {
    setLoading(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !banned }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: !banned } : u)));
      toast.success(
        !banned ? "User banned" : "User unbanned",
        !banned ? "The user can no longer log in" : "The user can now log in again"
      );
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error("Action failed", data.error ?? "Could not update user");
    }
    setLoading(null);
  };

  return (
    <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-[#e5e5e5] bg-[#fafafa]">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">User</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Role</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Subscription</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Products</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Orders</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Joined</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Status</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-[#6b6b6b]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e5e5]">
          {users.map((u) => (
            <tr key={u.id} className={`hover:bg-[#fafafa] ${u.banned ? "opacity-60" : ""}`}>
              <td className="px-4 py-3">
                <p className="font-medium text-[#0a0a0a]">{u.name}</p>
                <p className="text-xs text-[#a3a3a3]">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">
                  {u.role === "SELLER" ? "Seller" : u.role === "ADMIN" ? "Admin" : "Buyer"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {u.subscription?.plan === "PREMIUM" ? (
                  <Badge variant="default">Premium</Badge>
                ) : (
                  <span className="text-xs text-[#a3a3a3]">Free</span>
                )}
              </td>
              <td className="px-4 py-3 text-[#6b6b6b]">{u._count.products}</td>
              <td className="px-4 py-3 text-[#6b6b6b]">{u._count.orders}</td>
              <td className="px-4 py-3 text-xs text-[#6b6b6b]">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                {u.banned ? (
                  <Badge variant="red">Banned</Badge>
                ) : (
                  <Badge variant="green">Active</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {u.role !== "ADMIN" && (
                  <Button
                    variant={u.banned ? "outline" : "danger"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    loading={loading === u.id}
                    onClick={() => toggleBan(u.id, u.banned)}
                  >
                    {u.banned ? "Unban" : "Ban"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
