import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [mastersCount, categoriesCount, reviewsCount, ordersCount] = await Promise.all([
      db.master.count(),
      db.category.count(),
      db.review.count(),
      db.order.count(),
    ]);
    const completed = await db.master.aggregate({ _sum: { completedOrders: true } });
    return NextResponse.json({
      masters: mastersCount,
      categories: categoriesCount,
      reviews: reviewsCount,
      orders: ordersCount,
      completedOrders: completed._sum.completedOrders || 0,
    });
  } catch (e) {
    console.error('GET /api/stats error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
