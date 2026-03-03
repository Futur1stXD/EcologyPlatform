import { prisma } from "@/lib/prisma";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { Select } from "@/components/ui/Select";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const products = await prisma.product.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    include: {
      seller: { select: { name: true, email: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Products ({products.length})</h1>

        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ].map((opt) => (
            <a
              key={opt.value}
              href={`/admin/products${opt.value ? `?status=${opt.value}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (status ?? "") === opt.value
                  ? "bg-[#0a0a0a] text-white"
                  : "border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5]"
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>
      </div>

      <AdminProductsTable products={products} />
    </div>
  );
}
