"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (rating === 0) { setError("Выберите рейтинг"); return; }
    if (comment.trim().length < 3) { setError("Отзыв слишком короткий"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка отправки");
    }
    setLoading(false);
  };

  return (
    <div className="border border-[#e5e5e5] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#0a0a0a] mb-4">Оставить отзыв</h3>

      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={22}
              className={`transition-colors ${
                star <= (hovered || rating) ? "fill-[#0a0a0a] text-[#0a0a0a]" : "text-[#e5e5e5]"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Ваш отзыв..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3"
      />

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <Button onClick={submit} loading={loading} size="sm">Отправить отзыв</Button>
    </div>
  );
}
