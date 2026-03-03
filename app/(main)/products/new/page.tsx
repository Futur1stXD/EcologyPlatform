"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateEcoScore } from "@/lib/eco-score";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  price: z.coerce.number().positive("Введите корректную цену"),
  category: z.string().min(1, "Выберите категорию"),
  origin: z.string().min(2, "Укажите происхождение"),
  materialsRaw: z.string().min(2, "Укажите материалы (через запятую)"),
  imagesRaw: z.string().optional(),
  hasRecycling: z.boolean().optional(),
  hasOrganicCert: z.boolean().optional(),
  isFairTrade: z.boolean().optional(),
  packagingType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  { value: "", label: "Выберите категорию" },
  { value: "Одежда", label: "Одежда" },
  { value: "Косметика", label: "Косметика" },
  { value: "Продукты", label: "Продукты" },
  { value: "Дом", label: "Дом и быт" },
  { value: "Электроника", label: "Электроника" },
  { value: "Упаковка", label: "Упаковка" },
  { value: "Другое", label: "Другое" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [previewScore, setPreviewScore] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const watchedFields = watch(["materialsRaw", "origin", "hasRecycling", "hasOrganicCert", "isFairTrade", "packagingType"]);

  const calcPreview = () => {
    const [materialsRaw, origin, hasRecycling, hasOrganicCert, isFairTrade, packagingType] = watchedFields;
    const materials = (materialsRaw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const score = calculateEcoScore({
      materials,
      origin: origin ?? "",
      hasRecycling: !!hasRecycling,
      hasOrganicCert: !!hasOrganicCert,
      isFairTrade: !!isFairTrade,
      packagingType: packagingType ?? "",
    });
    setPreviewScore(score);
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const materials = data.materialsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const images = data.imagesRaw ? data.imagesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const ecoScore = calculateEcoScore({
      materials,
      origin: data.origin,
      hasRecycling: !!data.hasRecycling,
      hasOrganicCert: !!data.hasOrganicCert,
      isFairTrade: !!data.isFairTrade,
      packagingType: data.packagingType ?? "",
    });

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, materials, images, ecoScore }),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Ошибка создания");
      return;
    }

    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Добавить товар</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">Товар будет опубликован после проверки модератором.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input id="title" label="Название товара *" placeholder="Напр. Бамбуковая зубная щётка" error={errors.title?.message} {...register("title")} />
        <Textarea id="description" label="Описание *" placeholder="Расскажите о товаре, его экологических характеристиках..." error={errors.description?.message} {...register("description")} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="price" type="number" label="Цена (₽) *" placeholder="0" error={errors.price?.message} {...register("price")} />
          <Select id="category" label="Категория *" options={CATEGORIES} error={errors.category?.message} {...register("category")} />
        </div>

        <Input id="origin" label="Происхождение / регион *" placeholder="Россия, Москва" error={errors.origin?.message} {...register("origin")} />
        <Input id="materialsRaw" label="Материалы * (через запятую)" placeholder="Бамбук, переработанный пластик" error={errors.materialsRaw?.message} {...register("materialsRaw")} />
        <Input id="imagesRaw" label="Ссылки на фото (через запятую)" placeholder="https://..." {...register("imagesRaw")} />
        <Input id="packagingType" label="Тип упаковки" placeholder="Переработанная бумага, биоразлагаемый" {...register("packagingType")} />

        {/* Eco attributes */}
        <div className="border border-[#e5e5e5] rounded-xl p-4">
          <p className="text-sm font-medium text-[#0a0a0a] mb-3">Экологические сертификаты</p>
          <div className="flex flex-col gap-2">
            {[
              { id: "hasRecycling", label: "Товар из переработанного сырья" },
              { id: "hasOrganicCert", label: "Органический сертификат" },
              { id: "isFairTrade", label: "Fair Trade" },
            ].map((attr) => (
              <label key={attr.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" {...register(attr.id as keyof FormData)} />
                <span className="text-sm text-[#0a0a0a]">{attr.label}</span>
              </label>
            ))}
          </div>

          <button type="button" onClick={calcPreview} className="mt-3 text-xs text-[#6b6b6b] underline">
            Рассчитать Eco-Score
          </button>

          {previewScore !== null && (
            <div className="mt-3">
              <EcoScoreBadge score={previewScore} showLabel />
            </div>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
          Отправить на модерацию
        </Button>
      </form>
    </div>
  );
}
