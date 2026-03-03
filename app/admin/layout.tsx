import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[#e5e5e5] bg-white flex-shrink-0">
        <div className="p-5 border-b border-[#e5e5e5]">
          <p className="text-sm font-bold text-[#0a0a0a]">Admin Dashboard</p>
          <p className="text-xs text-[#a3a3a3]">EcoMarket</p>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {[
            { href: "/admin", label: "Обзор" },
            { href: "/admin/products", label: "Товары" },
            { href: "/admin/users", label: "Пользователи" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a href="/" className="px-3 py-2 rounded-lg text-sm text-[#6b6b6b] hover:bg-[#f5f5f5] mt-auto transition-colors">
            ← На сайт
          </a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
