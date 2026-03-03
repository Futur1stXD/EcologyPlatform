"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateEcoScore } from "@/lib/eco-score";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  price: z.number().positive("Введите корректную цену"),
  category: z.string().min(1, "Выберите категорию"),
  origin: z.string().min(2, "Укажите происхождение"),
  materialsRaw: z.string().min(2, "Укажите материалы (через запятую)"),
  hasRecycling: z.boolean().optional(),
  hasOrganicCert: z.boolean().optional(),
  isFairTrade: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isLocalDelivery: z.boolean().optional(),
  hasCarbonNeutral: z.boolean().optional(),
  hasEnergyEfficiency: z.boolean().optional(),
  hasZeroWaste: z.boolean().optional(),
  isDurable: z.boolean().optional(),
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

const ECO_ATTRS = [
  { id: "hasRecycling",        label: "Из переработанного сырья",              points: "+12", icon: "♻️" },
  { id: "hasOrganicCert",      label: "Органический сертификат",               points: "+10", icon: "🌿" },
  { id: "hasCarbonNeutral",    label: "Углеродно-нейтральное производство",    points: "+10", icon: "🌍" },
  { id: "isFairTrade",         label: "Fair Trade",                            points: "+8",  icon: "🤝" },
  { id: "isVegan",             label: "Веганский продукт",                     points: "+8",  icon: "🌱" },
  { id: "hasEnergyEfficiency", label: "Возобновляемая энергия",                points: "+8",  icon: "⚡" },
  { id: "hasZeroWaste",        label: "Zero-Waste производство",               points: "+8",  icon: "🔄" },
  { id: "isLocalDelivery",     label: "Локальная доставка",                    points: "+7",  icon: "📍" },
  { id: "isDurable",           label: "Долговечный / многоразовый",            points: "+5",  icon: "💪" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const watchedFields = watch(["materialsRaw", "origin", "hasRecycling", "hasOrganicCert", "isFairTrade", "packagingType", "isVegan", "isLocalDelivery", "hasCarbonNeutral", "hasEnergyEfficiency", "hasZeroWaste", "isDurable"]);
  const formValues = watch();

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const next = [...imageFiles, ...arr].slice(0, 8);
    setImageFiles(next);
    setImagePreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return next.map((f) => URL.createObjectURL(f));
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((p) => p.filter((_, i) => i !== index));
    setImagePreviews((p) => p.filter((_, i) => i !== index));
  };

  const calcPreview = () => {
    const [materialsRaw, origin, hasRecycling, hasOrganicCert, isFairTrade, packagingType, isVegan, isLocalDelivery, hasCarbonNeutral, hasEnergyEfficiency, hasZeroWaste, isDurable] = watchedFields;
    const materials = (materialsRaw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const score = calculateEcoScore({
      materials,
      origin: origin ?? "",
      hasRecycling: !!hasRecycling,
      hasOrganicCert: !!hasOrganicCert,
      isFairTrade: !!isFairTrade,
      packagingType: packagingType ?? "",
      isVegan: !!isVegan,
      isLocalDelivery: !!isLocalDelivery,
      hasCarbonNeutral: !!hasCarbonNeutral,
      hasEnergyEfficiency: !!hasEnergyEfficiency,
      hasZeroWaste: !!hasZeroWaste,
      isDurable: !!isDurable,
    });
    setPreviewScore(score);
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const materials = data.materialsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    let images: string[] = [];
    if (imageFiles.length > 0) {
      const fd = new FormData();
      imageFiles.forEach((f) => fd.append("files", f));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) { setServerError("Ошибка загрузки фотографий"); return; }
      const { urls } = await uploadRes.json() as { urls: string[] };
      images = urls;
    }

    const ecoScore = calculateEcoScore({
      materials,
      origin: data.origin,
      hasRecycling: !!data.hasRecycling,
      hasOrganicCert: !!data.hasOrganicCert,
      isFairTrade: !!data.isFairTrade,
      packagingType: data.packagingType ?? "",
      isVegan: !!data.isVegan,
      isLocalDelivery: !!data.isLocalDelivery,
      hasCarbonNeutral: !!data.hasCarbonNeutral,
      hasEnergyEfficiency: !!data.hasEnergyEfficiency,
      hasZeroWaste: !!data.hasZeroWaste,
      isDurable: !!data.isDurable,
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
          <Input id="price" type="number" label="Цена (₸) *" placeholder="0" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
          <Select id="category" label="Категория *" options={CATEGORIES} error={errors.category?.message} {...register("category")} />
        </div>

        <Input id="origin" label="Происхождение / регион *" placeholder="Россия, Москва" error={errors.origin?.message} {...register("origin")} />
        <Input id="materialsRaw" label="Материалы * (через запятую)" placeholder="Бамбук, переработанный пластик" error={errors.materialsRaw?.message} {...register("materialsRaw")} />
        <Input id="packagingType" label="Тип упаковки" placeholder="Переработанная бумага, биоразлагаемый" {...register("packagingType")} />

        {/* Photo upload */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-2">Фотографии товара</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
            className={`w-full rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-2 transition-colors ${
              isDragging ? "border-green-500 bg-green-50" : "border-[#e5e5e5] hover:border-gray-300 hover:bg-[#fafafa]"
            }`}
          >
            <Upload size={24} className="text-[#6b6b6b]" />
            <span className="text-sm font-medium text-[#0a0a0a]">Нажмите или перетащите фото</span>
            <span className="text-xs text-[#6b6b6b]">JPG, PNG, WEBP · до 8 фотографий</span>
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e5e5e5] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eco attributes */}
        <div className="border border-[#e5e5e5] rounded-xl p-5">
          <p className="text-sm font-medium text-[#0a0a0a] mb-1">Экологические характеристики</p>
          <p className="text-xs text-[#6b6b6b] mb-4">Выберите всё, что подходит — каждый пункт повышает Eco-Score</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ECO_ATTRS.map((attr) => {
              const isChecked = !!formValues[attr.id as keyof FormData];
              return (
                <label
                  key={attr.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    isChecked
                      ? "border-green-500 bg-green-50"
                      : "border-[#e5e5e5] bg-white hover:border-gray-300 hover:bg-[#fafafa]"
                  }`}
                >
                  <input type="checkbox" className="sr-only" {...register(attr.id as keyof FormData)} />
                  <span className="text-base leading-none">{attr.icon}</span>
                  <span className={`text-xs flex-1 leading-snug ${
                    isChecked ? "text-green-900 font-medium" : "text-[#3a3a3a]"
                  }`}>{attr.label}</span>
                  <span className={`text-xs font-bold shrink-0 ${
                    isChecked ? "text-green-600" : "text-[#b0b0b0]"
                  }`}>{attr.points}</span>
                  {isChecked && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                </label>
              );
            })}
          </div>

          <button type="button" onClick={calcPreview} className="mt-4 text-xs font-medium text-[#0a0a0a] underline">
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
