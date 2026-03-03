import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getEcoScoreResult } from "@/lib/eco-score";
import { EcoScoreBadge } from "./EcoScoreBadge";
import type { ProductWithSeller } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: ProductWithSeller;
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const isPremium = product.seller?.subscription?.plan === "PREMIUM";

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden hover:border-[#a3a3a3] hover:shadow-sm transition-all">
        {/* Image */}
        <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#a3a3a3] text-sm">Нет фото</div>
          )}

          {/* Featured badge for premium sellers */}
          {isPremium && product.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="text-[10px]">⭐ Топ</Badge>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <EcoScoreBadge score={product.ecoScore} compact />
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-[#6b6b6b] mb-0.5">{product.category}</p>
          <h3 className="text-sm font-medium text-[#0a0a0a] line-clamp-2 leading-snug">{product.title}</h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0a0a0a]">{formatPrice(product.price)}</span>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-[#0a0a0a] text-[#0a0a0a]" />
                <span className="text-xs text-[#6b6b6b]">
                  {avgRating.toFixed(1)} ({product.reviews.length})
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#a3a3a3] mt-1">
            {product.seller?.name ?? "Продавец"}
          </p>
        </div>
      </div>
    </Link>
  );
}
