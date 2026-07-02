import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CreateReviewBody {
  masterId: string;
  authorName: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  jobTitle?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateReviewBody;
    const { masterId, authorName, rating, text } = body;

    if (!masterId || !authorName || !text) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 });
    }
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    if (r < 1 || r > 5) {
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 });
    }
    if (text.trim().length < 10) {
      return NextResponse.json({ error: 'Отзыв слишком короткий (минимум 10 символов)' }, { status: 400 });
    }

    const master = await db.master.findUnique({ where: { id: masterId } });
    if (!master) {
      return NextResponse.json({ error: 'Мастер не найден' }, { status: 404 });
    }

    const review = await db.review.create({
      data: {
        masterId,
        authorName: authorName.trim().slice(0, 80),
        rating: r,
        text: text.trim().slice(0, 2000),
        pros: body.pros?.trim().slice(0, 300) || null,
        cons: body.cons?.trim().slice(0, 300) || null,
        jobTitle: body.jobTitle?.trim().slice(0, 120) || null,
      },
    });

    // Recalculate master rating
    const agg = await db.review.aggregate({
      where: { masterId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const newRating = Math.round((agg._avg.rating || 0) * 10) / 10;
    await db.master.update({
      where: { id: masterId },
      data: {
        rating: newRating,
        reviewsCount: agg._count.rating,
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
        jobTitle: review.jobTitle,
        createdAt: review.createdAt.toISOString(),
      },
      masterRating: newRating,
      masterReviewsCount: agg._count.rating,
    });
  } catch (e) {
    console.error('POST /api/reviews error', e);
    return NextResponse.json({ error: 'Не удалось сохранить отзыв' }, { status: 500 });
  }
}
