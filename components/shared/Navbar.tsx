"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Leaf, Menu, X, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CartDrawer } from "@/components/shared/CartDrawer";
import { useCartStore } from "@/lib/store/cart";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? totalItems() : 0;

  useEffect(() => {
    if (!session) return;
    const fetchUnread = () =>
      fetch("/api/chat/unread").then(r => r.ok ? r.json() : null).then(d => d && setUnreadCount(d.count));
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => clearInterval(id);
  }, [session]);

  const navLinks = [
    { href: "/products", label: "Products" },
    ...(session
      ? [
          { href: "/chat", label: "Chat", badge: unreadCount },
          { href: "/rewards", label: "Rewards" },
        ]
      : []),
    ...(session?.user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
    <CartDrawer />
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-[#0a0a0a] w-fit">
              <Leaf size={20} className="text-green-600" />
              <span className="text-lg tracking-tight">EcoMarket</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors"
              >
                {link.label}
                {"badge" in link && (link as { badge: number }).badge > 0 && (
                  <span className="absolute -top-2 -right-3 h-4 min-w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {(link as { badge: number }).badge > 9 ? "9+" : (link as { badge: number }).badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={18} className="text-[#0a0a0a]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                  {cartCount}
                </span>
              )}
            </button>
            {session ? (
              <>
                {(session.user?.role === "SELLER" || session.user?.role === "ADMIN") && (
                  <Link href="/products/new">
                    <Button variant="outline" size="sm">
                      + Add Product
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <button className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white text-xs font-medium flex items-center justify-center">
                    {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="relative p-2 rounded-lg hover:bg-[#f5f5f5]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              {!mobileOpen && unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e5e5e5] py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative inline-flex items-center gap-2 text-sm text-[#0a0a0a] py-1 w-fit"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                {"badge" in link && (link as { badge: number }).badge > 0 && (
                  <span className="h-4 min-w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {(link as { badge: number }).badge > 9 ? "9+" : (link as { badge: number }).badge}
                  </span>
                )}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/profile" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                {(session.user?.role === "SELLER" || session.user?.role === "ADMIN") && (
                  <Link href="/products/new" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                    + Add Product
                  </Link>
                )}
                <button
                  className="text-sm text-left text-red-600 py-1"
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="text-sm text-[#0a0a0a] py-1" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
