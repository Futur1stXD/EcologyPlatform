"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Leaf, Menu, X, ShoppingBag, MessageCircle, User, BarChart2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "Товары" },
    ...(session
      ? [
          { href: "/chat", label: "Чат" },
          { href: "/rewards", label: "Награды" },
        ]
      : []),
    ...(session?.user?.role === "ADMIN" ? [{ href: "/admin", label: "Админ" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#0a0a0a]">
            <Leaf size={20} className="text-green-600" />
            <span className="text-lg tracking-tight">EcoMarket</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
                  <Link href="/products/new">
                    <Button variant="outline" size="sm">
                      + Добавить товар
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <button className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white text-xs font-medium flex items-center justify-center">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Войти</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#f5f5f5]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e5e5e5] py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#0a0a0a] py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/profile" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Профиль
                </Link>
                <button
                  className="text-sm text-left text-red-600 py-1"
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Войти
                </Link>
                <Link href="/register" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
