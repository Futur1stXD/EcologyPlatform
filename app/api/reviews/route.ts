import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
});

// POST /api/reviews — create or update review
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId: data.productId, userId: session.user.id } },
      update: { rating: data.rating, comment: data.comment },
      create: { ...data, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
