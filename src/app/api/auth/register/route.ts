import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Simple hash for demo — NOT production grade
async function hashPassword(pw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + '__masterok_salt__');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone, profession, skills, city, categoryId, bio } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Имя, email и пароль обязательны' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: 'Пароль должен быть не менее 4 символов' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const userRole = role === 'master' ? 'master' : 'client';

    let masterId: string | null = null;

    if (userRole === 'master') {
      if (!profession?.trim() || !city?.trim() || !categoryId) {
        return NextResponse.json({ error: 'Для регистрации мастером укажите профессию, город и категорию' }, { status: 400 });
      }

      const master = await db.master.create({
        data: {
          name: name.trim(),
          avatar: `/avatars/default.png`,
          profession: profession.trim(),
          bio: bio?.trim() || `Мастер в категории ${profession.trim()}. Готов помочь с вашими задачами!`,
          city: city.trim(),
          categoryId,
          priceFrom: 500,
          priceTo: 15000,
          skills: (skills || '').trim(),
          responseTime: 'в течение часа',
          verified: false,
          topRated: false,
          experienceYears: 1,
          rating: 0,
          reviewsCount: 0,
          completedOrders: 0,
        },
      });
      masterId = master.id;

      await db.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashed,
          role: 'master',
          phone: phone?.trim() || null,
          masterId,
        },
      });
    } else {
      await db.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashed,
          role: 'client',
          phone: phone?.trim() || null,
        },
      });
    }

    // Fetch the created user to return
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    return NextResponse.json({
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        masterId: user!.masterId,
      },
    });
  } catch (e: any) {
    console.error('Register error:', e);
    return NextResponse.json({ error: e.message || 'Ошибка регистрации' }, { status: 500 });
  }
}