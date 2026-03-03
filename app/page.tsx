import Link from "next/link";
import { Leaf, ShieldCheck, Star, Zap, ArrowRight, CheckCircle, Users, Package, TrendingUp, Recycle, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const CATEGORIES = [
  { label: "Одежда",      emoji: "👗", desc: "Органический хлопок, лён, переработанные волокна", color: "bg-stone-50" },
  { label: "Косметика",   emoji: "🌿", desc: "Натуральные ингредиенты без вредной химии",        color: "bg-green-50" },
  { label: "Продукты",    emoji: "🥦", desc: "Органические и фермерские продукты питания",       color: "bg-lime-50" },
  { label: "Дом и быт",   emoji: "🏡", desc: "Экологичные товары для дома и кухни",             color: "bg-amber-50" },
  { label: "Электроника", emoji: "♻️", desc: "Переработанная и энергоэффективная техника",      color: "bg-blue-50" },
  { label: "Упаковка",    emoji: "📦", desc: "Биоразлагаемые и многоразовые решения",           color: "bg-teal-50" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Найдите товар",
    desc: "Используйте фильтры по категории, Eco-Score и цене. Каждый товар содержит полную информацию о составе и происхождении.",
    icon: <Package size={24} className="text-green-600" />,
  },
  {
    step: "02",
    title: "Проверьте Eco-Score",
    desc: "Алгоритм оценивает товар по 10+ критериям: материалы, упаковка, происхождение, сертификаты — всё прозрачно.",
    icon: <Leaf size={24} className="text-green-600" />,
  },
  {
    step: "03",
    title: "Купите безопасно",
    desc: "Оплата через Stripe. После покупки вы получаете Eco-очки и значок — каждая покупка меняет планету.",
    icon: <CheckCircle size={24} className="text-green-600" />,
  },
];

const FEATURES = [
  { icon: <Leaf size={20} className="text-green-600" />,    title: "Eco-Score 1–100",              desc: "Алгоритм учитывает материалы, упаковку, происхождение, сертификаты (organic, fair trade, carbon neutral) и многое другое." },
  { icon: <ShieldCheck size={20} />,                        title: "Модерация товаров",             desc: "Каждый товар проходит проверку администратором — никаких псевдо-эко продуктов." },
  { icon: <Star size={20} />,                               title: "Честные отзывы",                desc: "Отзывы только от реальных покупателей. Прямой чат с продавцом для уточнения деталей." },
  { icon: <Zap size={20} />,                                title: "Eco-награды",                   desc: "Зарабатывайте очки за каждую покупку. Открывайте значки: Green Buyer, Eco-Hero и другие." },
  { icon: <Globe size={20} />,                              title: "Местные производители",         desc: "Поддерживайте локальных производителей — меньше углеродного следа от доставки." },
  { icon: <TrendingUp size={20} />,                         title: "Premium для продавцов",         desc: "Приоритетное размещение, расширенная аналитика и значок Premium-продавца." },
];

const ECO_FACTS = [
  { num: "73%",  label: "покупателей готовы платить больше за экологичные товары" },
  { num: "2×",   label: "быстрее растёт рынок eco-продуктов по сравнению с обычным" },
  { num: "40%",  label: "выбросов CO₂ можно сократить через осознанное потребление" },
];

const SCORE_CRITERIA = [
  { label: "Eco-материалы (бамбук, лён, переработанные)",   points: "до +30" },
  { label: "Переработанное сырьё",                          points: "+12"   },
  { label: "Углеродно-нейтральное производство",            points: "+10"   },
  { label: "Органический сертификат",                       points: "+10"   },
  { label: "Fair Trade сертификат",                         points: "+8"    },
  { label: "Веганский продукт",                             points: "+8"    },
  { label: "Zero-Waste производство",                       points: "+8"    },
  { label: "Возобновляемая энергия при производстве",       points: "+8"    },
  { label: "Локальная доставка",                            points: "+7"    },
  { label: "Экологичная упаковка",                          points: "+8"    },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="relative border-b border-[#e5e5e5] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-28 md:py-52">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white/90 mb-6">
                <Leaf size={12} className="text-green-400" />
                Осознанное потребление · Казахстан
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
                Eco-товары от<br />
                <span className="italic font-light text-green-300">местных производителей</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                Переработанные, биоразлагаемые и устойчивые продукты с прозрачным Eco-Score.
                Поддерживайте производителей, которые заботятся о планете.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products"><Button size="lg">Смотреть товары</Button></Link>
                <Link href="/register"><Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/10">Стать продавцом</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="bg-[#0a0a0a] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {ECO_FACTS.map((fact) => (
                <div key={fact.num}>
                  <p className="text-4xl font-bold text-green-400 mb-1">{fact.num}</p>
                  <p className="text-sm text-white/60 leading-snug max-w-[200px] mx-auto">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-2">Каталог</p>
              <h2 className="text-3xl font-bold text-[#0a0a0a]">Категории товаров</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
              Все товары <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} href={`/products?category=${encodeURIComponent(cat.label)}`}
                className={`${cat.color} rounded-2xl p-5 hover:shadow-md transition-all group border border-transparent hover:border-[#e5e5e5]`}>
                <span className="text-3xl mb-3 block">{cat.emoji}</span>
                <h3 className="font-semibold text-[#0a0a0a] mb-1 group-hover:underline">{cat.label}</h3>
                <p className="text-xs text-[#6b6b6b] leading-snug">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="bg-[#f5f5f5] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-2">Просто и понятно</p>
              <h2 className="text-3xl font-bold text-[#0a0a0a]">Как это работает</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="relative">
                  <div className="bg-white rounded-2xl p-7 border border-[#e5e5e5] h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-xs font-bold text-[#a3a3a3] tracking-widest">{step.step}</span>
                      <div className="h-px flex-1 bg-[#e5e5e5]" />
                      <div className="p-2 bg-green-50 rounded-lg">{step.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#6b6b6b] leading-relaxed">{step.desc}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 bg-white border border-[#e5e5e5] rounded-full items-center justify-center shadow-sm">
                      <ArrowRight size={12} className="text-[#6b6b6b]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY ECOMARKET ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#6b6b6b] mb-2">Наши преимущества</p>
              <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4 leading-tight">
                Почему тысячи выбирают<br />
                <span className="text-green-600">EcoMarket</span>
              </h2>
              <p className="text-[#6b6b6b] leading-relaxed mb-6">
                Мы создали платформу, где каждая покупка — это вклад в экологию.
                Прозрачные оценки, проверенные продавцы и система наград делают осознанное потребление приятным.
              </p>
              <div className="space-y-3 mb-8">
                {["Eco-Score для каждого товара", "Только проверенные продавцы", "Безопасная оплата через Stripe", "Eco-очки за каждую покупку"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600 shrink-0" />
                    <span className="text-sm text-[#0a0a0a]">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/products"><Button size="lg">Перейти в каталог <ArrowRight size={16} className="ml-1" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="border border-[#e5e5e5] rounded-xl p-5 hover:border-green-200 hover:bg-green-50/30 transition-all">
                  <div className="mb-3 p-2 bg-[#f5f5f5] rounded-lg w-fit">{f.icon}</div>
                  <h3 className="text-sm font-semibold text-[#0a0a0a] mb-1">{f.title}</h3>
                  <p className="text-xs text-[#6b6b6b] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ECO-SCORE EXPLAINER ── */}
        <section className="bg-[#0a0a0a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs uppercase tracking-widest text-green-400 mb-2">Наша методология</p>
                <h2 className="text-3xl font-bold text-white mb-4">Как считается<br />Eco-Score</h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  От 1 до 100 — рассчитывается автоматически на основе данных продавца.
                  Чем выше балл, тем меньше вред для планеты.
                </p>
                <div className="flex gap-4">
                  {[{ range: "80–100", label: "Отлично", color: "text-green-400" }, { range: "60–79", label: "Хорошо", color: "text-lime-400" }, { range: "40–59", label: "Средне", color: "text-yellow-400" }, { range: "0–39", label: "Плохо", color: "text-red-400" }].map((g) => (
                    <div key={g.range} className="text-center">
                      <p className={`text-sm font-bold ${g.color}`}>{g.range}</p>
                      <p className="text-xs text-white/50 mt-0.5">{g.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {SCORE_CRITERIA.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-3 border-b border-white/10">
                    <span className="text-sm text-white/70">{item.label}</span>
                    <span className="text-sm font-semibold text-green-400 shrink-0">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR SELLERS ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-lime-50 border border-green-100 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 font-medium mb-4">
                <Recycle size={12} />
                Для производителей
              </div>
              <h2 className="text-3xl font-bold text-[#0a0a0a] mb-3 leading-tight">
                Продавайте eco-товары<br />на растущем рынке
              </h2>
              <p className="text-[#6b6b6b] leading-relaxed mb-5">
                Добавляйте товары бесплатно. С Premium — приоритетное размещение в каталоге,
                значок верифицированного продавца и расширенная аналитика.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register"><Button size="lg">Зарегистрироваться</Button></Link>
                <Link href="/subscription"><Button variant="outline" size="lg">Узнать о Premium</Button></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {[
                { icon: <Package size={18} />,    label: "Бесплатная\nпубликация" },
                { icon: <TrendingUp size={18} />, label: "Premium\nпродвижение" },
                { icon: <Heart size={18} />,      label: "Eco-аудитория\nкупит" },
                { icon: <Users size={18} />,      label: "Прямой чат\nс покупателями" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl border border-green-100 p-5 text-center shadow-sm">
                  <div className="text-green-600 flex justify-center mb-2">{item.icon}</div>
                  <p className="text-xs font-medium text-[#0a0a0a] whitespace-pre-line leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
