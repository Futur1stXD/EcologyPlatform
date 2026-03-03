"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const subscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/payments/create-checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setMessage("Ошибка. Попробуйте позже.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-3">Планы для продавцов</h1>
        <p className="text-[#6b6b6b] max-w-lg mx-auto">
          Расширьте охват и получите инструменты для роста продаж eco-товаров.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="border border-[#e5e5e5] rounded-2xl p-6">
          <p className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide mb-3">Бесплатно</p>
          <p className="text-3xl font-bold text-[#0a0a0a] mb-1">₸0</p>
          <p className="text-sm text-[#6b6b6b] mb-6">/ месяц</p>

          <ul className="space-y-2 mb-6">
            {[
              { label: "До 10 товаров", ok: true },
              { label: "Базовая аналитика", ok: true },
              { label: "Стандартное размещение", ok: true },
              { label: "Размещение в топе", ok: false },
              { label: "Featured-значок", ok: false },
              { label: "Расширенная аналитика", ok: false },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-[#d4d4d4] flex-shrink-0" />
                )}
                <span className={item.ok ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}>{item.label}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Текущий план
          </Button>
        </div>

        {/* Premium */}
        <div className="border-2 border-[#0a0a0a] rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-white text-xs px-3 py-1 rounded-full">
            Популярный
          </div>

          <p className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide mb-3">Premium</p>
          <p className="text-3xl font-bold text-[#0a0a0a] mb-1">₸9 990</p>
          <p className="text-sm text-[#6b6b6b] mb-6">/ месяц</p>

          <ul className="space-y-2 mb-6">
            {[
              "Неограниченное количество товаров",
              "Размещение в топе каталога",
              "⭐ Premium-значок на товарах",
              "Featured-позиция на главной",
              "Расширенная аналитика продаж",
              "Приоритетная поддержка",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-[#0a0a0a]">{item}</span>
              </li>
            ))}
          </ul>

          {session ? (
            <Button className="w-full" loading={loading} onClick={subscribe}>
              Подключить Premium
            </Button>
          ) : (
            <Button className="w-full" onClick={() => (window.location.href = "/login")}>
              Войти для подключения
            </Button>
          )}

          {message && <p className="text-xs text-red-500 text-center mt-2">{message}</p>}
        </div>
      </div>

      <p className="text-center text-xs text-[#a3a3a3] mt-8">
        Оплата через Stripe. Отмена подписки — в любой момент.
      </p>
    </div>
  );
}
