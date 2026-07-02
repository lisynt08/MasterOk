import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        master: {
          select: {
            id: true,
            name: true,
            avatar: true,
            profession: true,
            category: { select: { name: true, color: true } },
          },
        },
      },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        masterId: r.masterId,
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        rating: r.rating,
        text: r.text,
        pros: r.pros,
        cons: r.cons,
        jobTitle: r.jobTitle,
        createdAt: r.createdAt.toISOString(),
        master: r.master,
      })),
    });
  } catch (e) {
    console.error('GET /api/reviews/list error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}