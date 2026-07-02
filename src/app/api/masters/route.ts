import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { MastersQuery, MasterListItemDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

function splitSkills(s: string): string[] {
  return s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q: MastersQuery = {
      category: sp.get('category') || undefined,
      city: sp.get('city') || undefined,
      search: sp.get('search') || undefined,
      sort: (sp.get('sort') as MastersQuery['sort']) || undefined,
      minRating: sp.get('minRating') || undefined,
      maxPrice: sp.get('maxPrice') || undefined,
      verifiedOnly: sp.get('verifiedOnly') || undefined,
      topRatedOnly: sp.get('topRatedOnly') || undefined,
      top: sp.get('top') || undefined,
    };

    const where: any = {};
    if (q.category) {
      where.category = { slug: q.category };
    }
    if (q.city) {
      where.city = { contains: q.city };
    }
    if (q.search) {
      const s = q.search;
      where.OR = [
        { name: { contains: s } },
        { profession: { contains: s } },
        { bio: { contains: s } },
        { skills: { contains: s } },
        { area: { contains: s } },
      ];
    }
    if (q.minRating) {
      where.rating = { gte: parseFloat(q.minRating) };
    }
    if (q.maxPrice) {
      where.priceFrom = { lte: parseInt(q.maxPrice, 10) };
    }
    if (q.verifiedOnly === 'true') {
      where.verified = true;
    }
    if (q.topRatedOnly === 'true') {
      where.topRated = true;
    }

    let orderBy: any = { rating: 'desc' };
    switch (q.sort) {
      case 'price-asc': orderBy = { priceFrom: 'asc' }; break;
      case 'price-desc': orderBy = { priceFrom: 'desc' }; break;
      case 'reviews': orderBy = { reviewsCount: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      default: orderBy = { rating: 'desc' };
    }

    let take: number | undefined;
    if (q.top) take = parseInt(q.top, 10) || 6;

    const masters = await db.master.findMany({
      where,
      orderBy,
      take,
      include: { category: true },
    });

    const data: MasterListItemDTO[] = masters.map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      profession: m.profession,
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
      categoryId: m.categoryId,
      categoryName: m.category.name,
      categoryColor: m.category.color,
    }));

    return NextResponse.json({ masters: data, total: data.length });
  } catch (e) {
    console.error('GET /api/masters error', e);
    return NextResponse.json({ error: 'Failed to load masters' }, { status: 500 });
  }
}
