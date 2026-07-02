import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - list service reviews
export async function GET() {
  try {
    const reviews = await db.serviceReview.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        pros: r.pros,
        cons: r.cons,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('GET /api/service-reviews error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST - create service review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorName, rating, text, pros, cons } = body;

    if (!authorName || !rating || !text) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    if (text.trim().length < 10) {
      return NextResponse.json({ error: 'Отзыв слишком короткий (минимум 10 символов)' }, { status: 400 });
    }

    const review = await db.serviceReview.create({
      data: {
        authorName: authorName.trim().slice(0, 80),
        rating: r,
        text: text.trim().slice(0, 2000),
        pros: pros?.trim().slice(0, 300) || null,
        cons: cons?.trim().slice(0, 300) || null,
      },
    });

    return NextResponse.json({
      ok: true,
      review: {
        id: review.id,
        authorName: review.authorName,
        rating: review.rating,
        text: review.text,
        pros: review.pros,
        cons: review.cons,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error('POST /api/service-reviews error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}