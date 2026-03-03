import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";

const FREE_PLAN_LIMIT = 10;

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      lastName: true,
      dateOfBirth: true,
      email: true,
      role: true,
      bio: true,
      ecoPoints: true,
      createdAt: true,
      subscription: { select: { plan: true, currentPeriodEnd: true } },
      badges: { orderBy: { awardedAt: "desc" } },
      _count: { select: { products: true } },
      products: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, title: true, price: true, status: true, ecoScore: true, createdAt: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          totalPrice: true,
          createdAt: true,
          items: { select: { quantity: true, product: { select: { title: true } } } },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const BADGE_LABELS: Record<string, string> = {
    GREEN_BUYER: "🌿 Green Buyer",
    ECO_HERO: "🦸 Eco Hero",
    FIRST_PURCHASE: "🛍️ First Purchase",
    TEN_PURCHASES: "🔟 10 Purchases",
    HUNDRED_POINTS: "💯 100 Points",
  };

  const roleLabel =
    user.role === "ADMIN" ? "Admin" : user.role === "SELLER" ? "Seller" : "Member";

  const plan = user.subscription?.plan ?? "FREE";
  const isPremium = plan === "PREMIUM";
  const totalListings = user._count.products;
  const usedPct = Math.min(100, Math.round((totalListings / FREE_PLAN_LIMIT) * 100));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#0a0a0a] text-white text-xl font-bold flex items-center justify-center shrink-0">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0a0a0a]">
                {[user.name, user.lastName].filter(Boolean).join(" ")}
              </h1>
              <p className="text-sm text-[#6b6b6b]">{user.email}</p>
              {user.dateOfBirth && (
                <p className="text-xs text-[#a3a3a3] mt-0.5">
                  Born: {formatDate(user.dateOfBirth)}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline">{roleLabel}</Badge>
                {isPremium ? (
                  <Badge variant="default">⭐ Premium</Badge>
                ) : (
                  <Badge variant="outline">Free plan</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0a0a0a]">{user.ecoPoints}</p>
            <p className="text-xs text-[#6b6b6b]">eco-points</p>
          </div>
        </div>

        {user.bio && <p className="text-sm text-[#6b6b6b] mt-4">{user.bio}</p>}

        {/* Plan info + listing counter */}
        <div className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          {isPremium ? (
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wide mb-0.5">
                ⭐ Premium plan
              </p>
              <p className="text-xs text-[#6b6b6b]">
                Unlimited listings ·{" "}
                {user.subscription?.currentPeriodEnd
                  ? `Valid until ${formatDate(user.subscription.currentPeriodEnd)}`
                  : "Active"}
              </p>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wide">
                  Free plan — listings
                </p>
                <p className="text-xs font-bold text-[#0a0a0a]">
                  {totalListings}/{FREE_PLAN_LIMIT}
                </p>
              </div>
              <div className="w-full h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usedPct >= 100 ? "bg-red-500" : usedPct >= 70 ? "bg-yellow-400" : "bg-green-500"
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <p className="text-xs text-[#6b6b6b] mt-1">
                {totalListings >= FREE_PLAN_LIMIT
                  ? "Limit reached — upgrade to add more"
                  : `${FREE_PLAN_LIMIT - totalListings} listings remaining`}
              </p>
            </div>
          )}
          {!isPremium && (
            <Link href="/subscription" className="shrink-0">
              <Button size="sm">Upgrade to Premium</Button>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/products/new">
            <Button size="sm" variant="outline">+ Add product</Button>
          </Link>
          <Link href="/profile/settings">
            <Button size="sm" variant="outline">⚙️ Settings</Button>
          </Link>
          {!isPremium && (
            <Link href="/subscription">
              <Button size="sm" variant="secondary">Get Premium</Button>
            </Link>
          )}
          <Link href="/rewards">
            <Button size="sm" variant="secondary">🏆 My Rewards</Button>
          </Link>
        </div>
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b: { badge: string }) => (
              <span
                key={b.badge}
                className="rounded-full border border-[#e5e5e5] px-3 py-1 text-sm text-[#0a0a0a]"
              >
                {BADGE_LABELS[b.badge] ?? b.badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* My products — visible to ALL users */}
      {user.products.length > 0 ? (
        <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a]">My products</h2>
              {!isPremium && (
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  {totalListings}/{FREE_PLAN_LIMIT} listings used
                  {totalListings >= FREE_PLAN_LIMIT && (
                    <span className="ml-1 text-red-500 font-medium">· Limit reached</span>
                  )}
                </p>
              )}
            </div>
            <Link href="/products/new">
              <Button size="sm" variant="outline">+ New</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {user.products.map(
              (p: { id: string; title: string; price: number; status: string; ecoScore: number; createdAt: Date }) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-[#e5e5e5] last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0a0a0a] truncate">{p.title}</p>
                    <p className="text-xs text-[#6b6b6b]">
                      {formatDate(p.createdAt)} · {formatPrice(p.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EcoScoreBadge score={p.ecoScore} compact />
                    <Badge
                      variant={
                        p.status === "APPROVED" ? "green" : p.status === "REJECTED" ? "red" : "yellow"
                      }
                    >
                      {p.status === "APPROVED" ? "Published" : p.status === "REJECTED" ? "Rejected" : "Under review"}
                    </Badge>
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="text-xs text-[#6b6b6b] hover:text-[#0a0a0a] border border-[#e5e5e5] rounded-lg px-2 py-0.5"
                    >
                      Edit
                    </Link>
                    <Link href={`/products/${p.id}`} className="text-xs text-[#6b6b6b] hover:text-[#0a0a0a]">
                      View
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[#e5e5e5] rounded-2xl p-6 mb-6 text-center">
          <p className="text-sm text-[#6b6b6b] mb-3">You have no listings yet.</p>
          <Link href="/products/new">
            <Button size="sm">+ Add your first product</Button>
          </Link>
        </div>
      )}

      {/* Orders */}
      {user.orders.length > 0 && (
        <div className="border border-[#e5e5e5] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">Order history</h2>
          <div className="space-y-3">
            {user.orders.map(
              (o: { id: string; totalPrice: number; createdAt: Date; items: { quantity: number; product: { title: string } }[] }) => (
                <div key={o.id} className="py-2 border-b border-[#e5e5e5] last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#0a0a0a]">Order #{o.id.slice(-6)}</p>
                    <p className="text-sm font-semibold text-[#0a0a0a]">{formatPrice(o.totalPrice)}</p>
                  </div>
                  <p className="text-xs text-[#6b6b6b]">
                    {o.items.map((i) => `${i.product.title} × ${i.quantity}`).join(", ")}
                  </p>
                  <p className="text-xs text-[#a3a3a3] mt-1">{formatDate(o.createdAt)}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
