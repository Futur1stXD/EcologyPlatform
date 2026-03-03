import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [totalUsers, totalProducts, pendingProducts, totalOrders, ordersAgg, premiumSubs] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.subscription.count({ where: { plan: "PREMIUM" } }),
  ]);

  const stats = [
    { label: "Пользователей", value: totalUsers },
    { label: "Товаров", value: totalProducts },
    { label: "На модерации", value: pendingProducts, alert: pendingProducts > 0 },
    { label: "Заказов", value: totalOrders },
    { label: "Выручка", value: formatPrice(ordersAgg._sum.totalPrice ?? 0) },
    { label: "Premium подписок", value: premiumSubs },
  ];

  // Recent products pending moderation
  const pendingList = await prisma.product.findMany({
    where: { status: "PENDING" },
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-8">Обзор</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`border rounded-xl p-5 ${
              (stat as { alert?: boolean }).alert ? "border-yellow-400 bg-yellow-50" : "border-[#e5e5e5] bg-white"
            }`}
          >
            <p className="text-sm text-[#6b6b6b] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#0a0a0a]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending moderation */}
      {pendingList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0a0a0a]">Ожидают модерации ({pendingList.length})</h2>
            <a href="/admin/products" className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a]">Все товары →</a>
          </div>
          <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e5e5e5] bg-[#fafafa]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Товар</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Продавец</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b6b6b]">Eco-Score</th>
                  <th className="px-4 py-3 text-xs font-medium text-[#6b6b6b]">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {pendingList.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-[#0a0a0a] max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-[#6b6b6b]">{p.seller.name}</td>
                    <td className="px-4 py-3 text-[#0a0a0a] font-medium">{p.ecoScore}</td>
                    <td className="px-4 py-3">
                      <a href={`/admin/products?highlight=${p.id}`} className="text-xs font-medium text-[#0a0a0a] hover:underline">
                        Проверить
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
