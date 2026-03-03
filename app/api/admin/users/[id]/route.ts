import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id] — ban or unban a user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { banned } = await req.json();

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { banned },
    select: { id: true, banned: true },
  });

  return NextResponse.json(user);
}
