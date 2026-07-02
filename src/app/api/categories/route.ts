import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { CategoryDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cats = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { masters: true } } },
    });
    const data: CategoryDTO[] = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      color: c.color,
      mastersCount: c._count.masters,
    }));
    return NextResponse.json({ categories: data });
  } catch (e) {
    console.error('GET /api/categories error', e);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
