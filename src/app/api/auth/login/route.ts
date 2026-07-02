import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function hashPassword(pw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + '__masterok_salt__');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const hashed = await hashPassword(password);
    if (user.password !== hashed) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        masterId: user.masterId,
      },
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: e.message || 'Ошибка входа' }, { status: 500 });
  }
}