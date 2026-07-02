import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { MasterDetailDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

function splitSkills(s: string): string[] {
  return s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await db.master.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!m) {
      return NextResponse.json({ error: 'Master not found' }, { status: 404 });
    }

    const data: MasterDetailDTO = {
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      cover: m.cover,
      profession: m.profession,
      bio: m.bio,
      city: m.city,
      area: m.area,
      priceFrom: m.priceFrom,
      priceTo: m.priceTo,
      currency: m.currency,
      rating: m.rating,
      reviewsCount: m.reviewsCount,
      completedOrders: m.completedOrders,
      responseTime: m.responseTime,
      verified: m.verified,
      topRated: m.topRated,
      experienceYears: m.experienceYears,
      skills: splitSkills(m.skills),
      languages: m.languages,
      categoryId: m.categoryId,
      categoryName: m.category.name,
      categoryColor: m.category.color,
      reviews: m.reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        rating: r.rating,
        text: r.text,
        pros: r.pros,
        cons: r.cons,
        jobTitle: r.jobTitle,
        createdAt: r.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ master: data });
  } catch (e) {
    console.error('GET /api/masters/[id] error', e);
    return NextResponse.json({ error: 'Failed to load master' }, { status: 500 });
  }
}
