import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - fetch chat history for an order
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const messages = await db.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        orderId: m.orderId,
        masterId: m.masterId,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('GET /api/chat error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST - save a chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, masterId, sender, text } = body;

    if (!orderId || !masterId || !sender || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const message = await db.chatMessage.create({
      data: {
        orderId,
        masterId,
        sender,
        text: text.trim().slice(0, 5000),
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        orderId: message.orderId,
        masterId: message.masterId,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error('POST /api/chat error', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}