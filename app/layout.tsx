import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "EcoMarket — Экологичные товары",
  description:
    "Платформа для осознанных покупок: переработанные, устойчивые и eco-friendly товары от местных производителей.",
  keywords: ["экология", "eco-friendly", "устойчивое потребление", "зелёные покупки"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className={`${geist.variable} antialiased bg-white text-[#0a0a0a]`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
