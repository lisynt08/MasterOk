import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orders = await db.order.findMany({
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

    const data = orders.map((o) => ({
      id: o.id,
      masterId: o.masterId,
      clientName: o.clientName,
      clientPhone: o.clientPhone,
      jobTitle: o.jobTitle,
      description: o.description,
      budget: o.budget,
      preferredDate: o.preferredDate,
      address: o.address,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      master: o.master,
    }));

    return NextResponse.json({ orders: data });
  } catch (e) {
    console.error('GET /api/orders/list error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}