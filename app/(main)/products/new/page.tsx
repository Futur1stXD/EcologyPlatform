"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateEcoScore } from "@/lib/eco-score";
import { EcoScoreBadge } from "@/components/products/EcoScoreBadge";
import { toast } from "@/lib/store/toast";

const schema = z.object({
  title: z.string().min(3, "Minimum 3 characters"),
  description: z.string().min(10, "Minimum 10 characters"),
  price: z.number().positive("Enter a valid price"),
  category: z.string().min(1, "Select a category"),
  origin: z.string().min(2, "Enter origin"),
  materialsRaw: z.string().min(2, "Enter materials (comma-separated)"),
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
  { value: "", label: "Select category" },
  { value: "Одежда", label: "Clothing" },
  { value: "Косметика", label: "Cosmetics" },
  { value: "Продукты", label: "Food" },
  { value: "Дом", label: "Home & Living" },
  { value: "Электроника", label: "Electronics" },
  { value: "Упаковка", label: "Packaging" },
  { value: "Другое", label: "Other" },
];

const ECO_ATTRS = [
  { id: "hasRecycling",        label: "Made from recycled materials",       points: "+12", icon: "♻️" },
  { id: "hasOrganicCert",      label: "Organic certified",                  points: "+10", icon: "🌿" },
  { id: "hasCarbonNeutral",    label: "Carbon-neutral production",          points: "+10", icon: "🌍" },
  { id: "isFairTrade",         label: "Fair Trade",                         points: "+8",  icon: "🤝" },
  { id: "isVegan",             label: "Vegan product",                      points: "+8",  icon: "🌱" },
  { id: "hasEnergyEfficiency", label: "Renewable energy",                   points: "+8",  icon: "⚡" },
  { id: "hasZeroWaste",        label: "Zero-Waste production",              points: "+8",  icon: "🔄" },
  { id: "isLocalDelivery",     label: "Local delivery",                     points: "+7",  icon: "📍" },
  { id: "isDurable",           label: "Durable / reusable",                 points: "+5",  icon: "💪" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listingStats, setListingStats] = useState<{
    productCount: number;
    plan: string;
    limit: number | null;
    remaining: number | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/profile/listing-stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setListingStats(data));
  }, []);

  const atLimit = listingStats !== null && listingStats.remaining !== null && listingStats.remaining <= 0;

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
      if (!uploadRes.ok) {
        setServerError("Failed to upload photos");
        toast.error("Upload failed", "Could not upload the photos. Please try again.");
        return;
      }
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
      const msg = body.error ?? "Creation error";
      setServerError(msg);
      toast.error("Failed to create product", msg);
      return;
    }

    toast.success("Product submitted!", "It will appear in the catalogue after admin approval.");
    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Add product</h1>
      <p className="text-sm text-[#6b6b6b] mb-4">The product will be published after admin review.</p>

      {/* Listing counter banner */}
      {listingStats && listingStats.plan === "FREE" && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 mb-6 ${
            atLimit
              ? "border-red-200 bg-red-50"
              : listingStats.remaining! <= 2
              ? "border-yellow-200 bg-yellow-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          {atLimit ? (
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className={`text-xs font-semibold ${
                atLimit ? "text-red-700" : "text-[#0a0a0a]"
              }`}>
                {atLimit
                  ? "Listing limit reached"
                  : `Free plan — ${listingStats.remaining} of ${listingStats.limit} listings remaining`}
              </p>
              <span className="text-xs font-bold text-[#0a0a0a] shrink-0">
                {listingStats.productCount}/{listingStats.limit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  atLimit ? "bg-red-500" : listingStats.remaining! <= 2 ? "bg-yellow-400" : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((listingStats.productCount / listingStats.limit!) * 100))}%`,
                }}
              />
            </div>
            {atLimit && (
              <p className="text-xs text-red-600 mt-1">
                Upgrade to Premium for unlimited listings.{" "}
                <Link href="/subscription" className="underline font-medium">Learn more</Link>
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input id="title" label="Product name *" placeholder="e.g. Bamboo toothbrush" error={errors.title?.message} {...register("title")} />
        <Textarea id="description" label="Description *" placeholder="Describe the product and its eco features..." error={errors.description?.message} {...register("description")} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="price" type="number" label="Price (₸) *" placeholder="0" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
          <Select id="category" label="Category *" options={CATEGORIES} error={errors.category?.message} {...register("category")} />
        </div>

        <Input id="origin" label="Origin / region *" placeholder="Kazakhstan, Almaty" error={errors.origin?.message} {...register("origin")} />
        <Input id="materialsRaw" label="Materials * (comma-separated)" placeholder="Bamboo, recycled plastic" error={errors.materialsRaw?.message} {...register("materialsRaw")} />
        <Input id="packagingType" label="Packaging type" placeholder="Recycled paper, biodegradable" {...register("packagingType")} />

        {/* Photo upload */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-2">Product photos</p>
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
            <span className="text-sm font-medium text-[#0a0a0a]">Click or drag &amp; drop photos</span>
            <span className="text-xs text-[#6b6b6b]">JPG, PNG, WEBP · up to 8 photos</span>
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
          <p className="text-sm font-medium text-[#0a0a0a] mb-1">Eco attributes</p>
          <p className="text-xs text-[#6b6b6b] mb-4">Select all that apply — each one raises the Eco-Score</p>

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
            Calculate Eco-Score
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

        <Button type="submit" loading={isSubmitting} size="lg" className="w-full" disabled={atLimit}>
          Submit for review
        </Button>
      </form>
    </div>
  );
}
