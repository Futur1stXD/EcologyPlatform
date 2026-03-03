"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/Select";

const CATEGORIES = [
  { value: "", label: "Все категории" },
  { value: "Одежда", label: "Одежда" },
  { value: "Косметика", label: "Косметика" },
  { value: "Продукты", label: "Продукты" },
  { value: "Дом", label: "Дом и быт" },
  { value: "Электроника", label: "Электроника" },
  { value: "Упаковка", label: "Упаковка" },
  { value: "Другое", label: "Другое" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Новые" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "eco_score", label: "Eco-Score" },
];

const ECO_SCORE_OPTIONS = [
  { value: "", label: "Любой Eco-Score" },
  { value: "80", label: "Отлично (80+)" },
  { value: "60", label: "Хорошо (60+)" },
  { value: "40", label: "Средне (40+)" },
];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
        <input
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Поиск товаров..."
          className="h-10 w-full rounded-lg border border-[#e5e5e5] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors"
          onChange={(e) => updateParam("search", e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="w-44">
        <Select
          options={CATEGORIES}
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
        />
      </div>

      {/* Eco Score */}
      <div className="w-48">
        <Select
          options={ECO_SCORE_OPTIONS}
          value={searchParams.get("minEcoScore") ?? ""}
          onChange={(e) => updateParam("minEcoScore", e.target.value)}
        />
      </div>

      {/* Sort */}
      <div className="w-36">
        <Select
          options={SORT_OPTIONS}
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
        />
      </div>
    </div>
  );
}
