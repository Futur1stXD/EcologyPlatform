import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { ProductWithSeller } from "@/types";

interface Props {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minEcoScore?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getProducts(searchParams: Awaited<Props["searchParams"]>): Promise<{
  products: ProductWithSeller[];
  total: number;
  pages: number;
}> {
  const { category, search, minEcoScore, sort = "newest", page = "1" } = searchParams;
  const limit = 12;
  const skip = (parseInt(page) - 1) * limit;

  const where = {
    status: "APPROVED" as const,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(minEcoScore && { ecoScore: { gte: parseInt(minEcoScore) } }),
  };

  const orderBy = {
    newest: { createdAt: "desc" as const },
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    eco_score: { ecoScore: "desc" as const },
  }[sort] ?? { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip,
      take: limit,
      include: {
        seller: {
          select: { id: true, name: true, image: true, subscription: { select: { plan: true, currentPeriodEnd: true } } },
        },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products: products as unknown as ProductWithSeller[], total, pages: Math.ceil(total / limit) };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { products, total, pages } = await getProducts(params);
  const currentPage = parseInt(params.page ?? "1");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">Каталог товаров</h1>
        <p className="text-sm text-[#6b6b6b]">{total} товаров</p>
      </div>

      <div className="mb-6">
        <Suspense>
          <ProductFilters />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium text-[#0a0a0a] mb-2">Товары не найдены</p>
          <p className="text-sm text-[#6b6b6b]">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/products?${new URLSearchParams({ ...params, page: String(p) })}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-colors ${
                p === currentPage
                  ? "bg-[#0a0a0a] text-white"
                  : "border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5]"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
