import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#e5e5e5] bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-[#0a0a0a] mb-3">
              <Leaf size={18} className="text-green-600" />
              EcoMarket
            </Link>
            <p className="text-sm text-[#6b6b6b] leading-relaxed">
              Платформа для осознанных покупок. Поддерживаем местных eco-производителей.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#0a0a0a] mb-3">Платформа</h4>
            <ul className="space-y-2">
              {[
                { href: "/products", label: "Каталог товаров" },
                { href: "/subscription", label: "Премиум для продавцов" },
                { href: "/rewards", label: "Система наград" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#0a0a0a] mb-3">Помощь</h4>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Стать продавцом" },
                { href: "/login", label: "Войти" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#e5e5e5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#a3a3a3]">© 2026 EcoMarket. Все права защищены.</p>
          <p className="text-xs text-[#a3a3a3]">Сделано с 🌱 для планеты</p>
        </div>
      </div>
    </footer>
  );
}
