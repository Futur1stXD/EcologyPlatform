import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/products/[id] — approve or reject
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, isFeatured } = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(isFeatured !== undefined && { isFeatured }),
    },
  });

  return NextResponse.json(product);
}
