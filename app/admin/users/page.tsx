import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      subscription: { select: { plan: true } },
      _count: { select: { products: true, orders: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-6">Users ({users.length})</h1>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {users.map((u: typeof users[0]) => (
              <tr key={u.id} className="hover:bg-[#fafafa]">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
