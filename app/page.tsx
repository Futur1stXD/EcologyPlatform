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
        <section className="border-b border-[#e5e5e5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 md:py-36">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] px-3 py-1 text-xs text-[#6b6b6b] mb-6">
                <Leaf size={12} className="text-green-600" />
                Осознанное потребление
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] leading-tight mb-5">
                Eco-товары от
                <br />
                <span className="italic font-light">местных производителей</span>
              </h1>
              <p className="text-lg text-[#6b6b6b] leading-relaxed mb-8 max-w-lg">
                Находите переработанные, биоразлагаемые и устойчивые продукты с прозрачным
                Eco-Score. Поддерживайте производителей, которые заботятся о планете.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg">Смотреть товары</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg">Стать продавцом</Button>
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
