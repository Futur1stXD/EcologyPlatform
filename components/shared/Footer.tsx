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
              A platform for conscious shopping. Supporting local eco-producers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#0a0a0a] mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/products", label: "Product catalogue" },
                { href: "/subscription", label: "Premium for sellers" },
                { href: "/rewards", label: "Rewards" },
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
            <h4 className="text-sm font-semibold text-[#0a0a0a] mb-3">Help</h4>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Become a seller" },
                { href: "/login", label: "Sign in" },
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
          <p className="text-xs text-[#a3a3a3]">© 2026 EcoMarket. All rights reserved.</p>
          <p className="text-xs text-[#a3a3a3]">Made with 🌱 for the planet</p>
        </div>
      </div>
    </footer>
  );
}
