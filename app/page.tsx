import Link from "next/link";
import { Leaf, ShieldCheck, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative border-b border-[#e5e5e5] overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80&fit=crop')",
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-28 md:py-44">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white/90 mb-6">
                <Leaf size={12} className="text-green-400" />
                Осознанное потребление
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
                Eco-товары от
                <br />
                <span className="italic font-light text-green-300">местных производителей</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                Находите переработанные, биоразлагаемые и устойчивые продукты с прозрачным
                Eco-Score. Поддерживайте производителей, которые заботятся о планете.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg">Смотреть товары</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/10">Стать продавцом</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-bold text-[#0a0a0a] mb-12">Почему EcoMarket</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Leaf size={22} className="text-green-600" />,
                title: "Eco-Score",
                desc: "Прозрачная оценка влияния товара на окружающую среду по 100-балльной шкале.",
              },
              {
                icon: <ShieldCheck size={22} />,
                title: "Проверенные продавцы",
                desc: "Каждый товар проходит модерацию перед публикацией на платформе.",
              },
              {
                icon: <Star size={22} />,
                title: "Отзывы и рейтинг",
                desc: "Реальные отзывы покупателей и прямой чат с продавцом.",
              },
              {
                icon: <Zap size={22} />,
                title: "Награды",
                desc: "Зарабатывайте eco-очки за каждую покупку и получайте звание Eco-Героя.",
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-[#e5e5e5] rounded-xl p-5">
                <div className="mb-3">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-[#0a0a0a] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e5e5e5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Для продавцов</h2>
              <p className="text-[#6b6b6b] text-sm max-w-md">
                Получите Premium-размещение, продвижение в топе и расширенную аналитику.
              </p>
            </div>
            <Link href="/subscription">
              <Button size="lg" variant="outline">Узнать о Premium ›</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
