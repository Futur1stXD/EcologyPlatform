import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/Toaster";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "EcoMarket — Eco-friendly products",
  description:
    "A platform for conscious shopping: recycled, sustainable and eco-friendly products from local producers.",
  keywords: ["ecology", "eco-friendly", "sustainable consumption", "green shopping"],
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
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
