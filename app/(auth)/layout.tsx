import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="border-b border-[#e5e5e5] bg-white px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[#0a0a0a]">
          <Leaf size={18} className="text-green-600" />
          EcoMarket
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
