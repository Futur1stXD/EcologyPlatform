import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      ecoPoints: true,
      createdAt: true,
      subscription: { select: { plan: true, currentPeriodEnd: true } },
      badges: { orderBy: { awardedAt: "desc" } },
      products: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, price: true, status: true, ecoScore: true, createdAt: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, totalPrice: true, createdAt: true, items: { select: { quantity: true, product: { select: { title: true } } } } },
      },
    },
  });

  if (!user) redirect("/login");

  const isSeller = user.role === "SELLER" || user.role === "ADMIN";

  const BADGE_LABELS: Record<string, string> = {
    GREEN_BUYER: "🌿 Зелёный покупатель",
    ECO_HERO: "🦸 Eco-Герой",
    FIRST_PURCHASE: "🛍️ Первая покупка",
    TEN_PURCHASES: "🔟 10 покупок",
    HUNDRED_POINTS: "💯 100 очков",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#0a0a0a] text-white text-xl font-bold flex items-center justify-center">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0a0a0a]">{user.name}</h1>
              <p className="text-sm text-[#6b6b6b]">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{user.role === "SELLER" ? "Продавец" : user.role === "ADMIN" ? "Админ" : "Покупатель"}</Badge>
                {user.subscription?.plan === "PREMIUM" && <Badge variant="default">⭐ Premium</Badge>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0a0a0a]">{user.ecoPoints}</p>
            <p className="text-xs text-[#6b6b6b]">eco-очков</p>
          </div>
        </div>

        {user.bio && <p className="text-sm text-[#6b6b6b] mt-4">{user.bio}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          {isSeller && (
            <Link href="/products/new">
              <Button size="sm" variant="outline">+ Добавить товар</Button>
            </Link>
          )}
          {user.subscription?.plan !== "PREMIUM" && isSeller && (
            <Link href="/subscription">
              <Button size="sm" variant="secondary">Получить Premium</Button>
            </Link>
          )}
          <Link href="/rewards">
            <Button size="sm" variant="secondary">Мои награды</Button>
          </Link>
        </div>
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Достижения</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b: { badge: string }) => (
              <span key={b.badge} className="rounded-full border border-[#e5e5e5] px-3 py-1 text-sm text-[#0a0a0a]">
                {BADGE_LABELS[b.badge] ?? b.badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Products (seller) */}
      {isSeller && user.products.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Мои товары</h2>
          <div className="space-y-3">
            {user.products.map((p: { id: string; title: string; price: number; status: string; ecoScore: number; createdAt: Date }) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#e5e5e5] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{p.title}</p>
                  <p className="text-xs text-[#6b6b6b]">{formatDate(p.createdAt)} · {formatPrice(p.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <EcoScoreBadge score={p.ecoScore} compact />
                  <Badge variant={p.status === "APPROVED" ? "green" : p.status === "REJECTED" ? "red" : "yellow"}>
                    {p.status === "APPROVED" ? "Опубликован" : p.status === "REJECTED" ? "Отклонён" : "На проверке"}
                  </Badge>
                  <Link href={`/products/${p.id}`} className="text-xs text-[#6b6b6b] hover:text-[#0a0a0a]">
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {user.orders.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">История заказов</h2>
          <div className="space-y-3">
            {user.orders.map((o: { id: string; totalPrice: number; createdAt: Date; items: { quantity: number; product: { title: string } }[] }) => (
              <div key={o.id} className="py-2 border-b border-[#e5e5e5] last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[#0a0a0a]">Заказ #{o.id.slice(-6)}</p>
                  <p className="text-sm font-semibold text-[#0a0a0a]">{formatPrice(o.totalPrice)}</p>
                </div>
                <p className="text-xs text-[#6b6b6b]">
                  {o.items.map((i: { quantity: number; product: { title: string } }) => `${i.product.title} × ${i.quantity}`).join(", ")}
                </p>
                <p className="text-xs text-[#a3a3a3] mt-1">{formatDate(o.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
