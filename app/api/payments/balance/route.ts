import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true, cashbackBalance: true, cashbackEarned: true },
  });

  const transactions = await prisma.balanceTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    balance: user?.balance ?? 0,
    cashbackBalance: user?.cashbackBalance ?? 0,
    cashbackEarned: user?.cashbackEarned ?? 0,
    transactions,
  });
}
