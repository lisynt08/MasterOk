import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CreateOrderBody {
  masterId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  jobTitle: string;
  description: string;
  budget?: number;
  preferredDate?: string;
  address?: string;
}

function normalizePhone(p: string): string {
  return p.replace(/[^\d+]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;
    const { masterId, clientName, clientPhone, jobTitle, description } = body;

    if (!masterId || !clientName || !clientPhone || !jobTitle || !description) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }
    const phone = normalizePhone(clientPhone);
    if (phone.length < 10) {
      return NextResponse.json({ error: 'Некорректный номер телефона' }, { status: 400 });
    }
    if (description.trim().length < 15) {
      return NextResponse.json({ error: 'Опишите задачу подробнее (минимум 15 символов)' }, { status: 400 });
    }

    const master = await db.master.findUnique({ where: { id: masterId } });
    if (!master) {
      return NextResponse.json({ error: 'Мастер не найден' }, { status: 404 });
    }

    const order = await db.order.create({
      data: {
        masterId,
        clientName: clientName.trim().slice(0, 120),
        clientPhone: phone,
        clientEmail: body.clientEmail?.trim().slice(0, 120) || null,
        jobTitle: jobTitle.trim().slice(0, 200),
        description: description.trim().slice(0, 3000),
        budget: body.budget ? Math.max(0, Math.round(Number(body.budget))) : null,
        preferredDate: body.preferredDate?.trim().slice(0, 60) || null,
        address: body.address?.trim().slice(0, 300) || null,
        status: 'new',
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      masterName: master.name,
    });
  } catch (e) {
    console.error('POST /api/orders error', e);
    return NextResponse.json({ error: 'Не удалось создать заявку' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await db.order.count();
    const byStatus = await db.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return NextResponse.json({ total: count, byStatus });
  } catch (e) {
    console.error('GET /api/orders error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
