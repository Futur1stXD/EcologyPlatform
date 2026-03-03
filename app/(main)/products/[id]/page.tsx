import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageCircle, MapPin, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";
import { Badge } from "@/components/ui/Badge";
import { ContactSellerButton } from "@/components/products/ContactSellerButton";
import { ReviewForm } from "@/components/products/ReviewForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { title: true } });
  return { title: product ? `${product.title} — EcoMarket` : "Товар" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      seller: {
        select: { id: true, name: true, image: true, bio: true, subscription: { select: { plan: true, currentPeriodEnd: true } } },
      },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const isPremium = product.seller.subscription?.plan === "PREMIUM";
  const canReview = session && session.user.id !== product.sellerId;
  const hasReviewed = product.reviews.some((r: { userId: string }) => r.userId === session?.user?.id);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f5f5]">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-[#a3a3a3]">Нет фото</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f5]">
                  <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-[#6b6b6b] mb-1">{product.category}</p>
              <h1 className="text-2xl font-bold text-[#0a0a0a] leading-tight">{product.title}</h1>
            </div>
            {isPremium && <Badge variant="default">⭐ Premium</Badge>}
          </div>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= Math.round(avgRating) ? "fill-[#0a0a0a] text-[#0a0a0a]" : "text-[#e5e5e5]"}
                  />
                ))}
              </div>
              <span className="text-sm text-[#6b6b6b]">
                {avgRating.toFixed(1)} ({product.reviews.length} отзывов)
              </span>
            </div>
          )}

          <p className="text-3xl font-bold text-[#0a0a0a] mb-5">{formatPrice(product.price)}</p>

          {/* Eco-Score */}
          <div className="border border-[#e5e5e5] rounded-xl p-4 mb-5">
            <EcoScoreBadge score={product.ecoScore} showLabel />
          </div>

          {/* Meta */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <MapPin size={14} />
              Происхождение: <span className="text-[#0a0a0a] font-medium">{product.origin}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-[#6b6b6b]">
              <Package size={14} className="mt-0.5" />
              Материалы:{" "}
              <div className="flex flex-wrap gap-1">
                {product.materials.map((m: string) => (
                  <Badge key={m} variant="outline">{m}</Badge>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-[#6b6b6b] leading-relaxed mb-6">{product.description}</p>

          {/* Seller */}
          <div className="border border-[#e5e5e5] rounded-xl p-4 mb-5">
            <p className="text-xs text-[#a3a3a3] mb-2">Продавец</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#0a0a0a] text-white text-sm font-medium flex items-center justify-center">
                  {product.seller.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{product.seller.name}</p>
                  {product.seller.bio && (
                    <p className="text-xs text-[#6b6b6b] line-clamp-1">{product.seller.bio}</p>
                  )}
                </div>
              </div>
              {session && session.user.id !== product.sellerId && (
                <ContactSellerButton sellerId={product.seller.id} productId={product.id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14 border-t border-[#e5e5e5] pt-10">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-6">
          Отзывы ({product.reviews.length})
        </h2>

        {canReview && !hasReviewed && (
          <div className="mb-8">
            <ReviewForm productId={product.id} />
          </div>
        )}

        {product.reviews.length === 0 ? (
          <p className="text-sm text-[#6b6b6b]">Отзывов пока нет. Будьте первым!</p>
        ) : (
          <div className="space-y-5">
            {product.reviews.map((review: { id: string; rating: number; comment: string; createdAt: Date; userId: string; user: { id: string; name: string | null; image: string | null } }) => (
              <div key={review.id} className="border border-[#e5e5e5] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#f5f5f5] text-[#0a0a0a] text-xs font-medium flex items-center justify-center">
                      {review.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm font-medium text-[#0a0a0a]">{review.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= review.rating ? "fill-[#0a0a0a] text-[#0a0a0a]" : "text-[#e5e5e5]"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#6b6b6b]">{review.comment}</p>
                <p className="text-xs text-[#a3a3a3] mt-2">{formatDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
