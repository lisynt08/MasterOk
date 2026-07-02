import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface AssistantBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const SYSTEM_PROMPT = `Ты — «Профи-Навигатор», AI-ассистент маркетплейса мастеров «МастерОк».
Помогаешь пользователю подобрать подходящего исполнителя под его задачу.

У тебя есть актуальный список мастеров (каталог) в формате JSON.
Твоя задача:
1. Понять, что именно нужно пользователю (категория услуги, бюджет, срочность, район).
2. Подобрать 1–3 наиболее подходящих мастеров из каталога по релевантности.
3. Кратко и по-человечески объяснить, почему именно они подходят.
4. При необходимости задать уточняющий вопрос.

Формат ответа — СТРОГО валидный JSON без markdown:
{
  "answer": "дружелюбный ответ на русском (2-4 предложения)",
  "recommendations": [
    { "masterId": "id мастера из каталога", "reason": "короткая причина выбора" }
  ],
  "followupQuestion": "уточняющий вопрос или null"
}

Правила:
- Отвечай только на русском.
- Не выдумывай мастеров, которых нет в каталоге.
- Будь кратким и дружелюбным.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AssistantBody;
    const userMessage = (body.message || '').trim();
    if (!userMessage) return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 });

    const masters = await db.master.findMany({ include: { category: true }, orderBy: { rating: 'desc' } });
    const catalog = masters.map((m) => ({
      ...m,
      categoryName: m.category.name,
      skills: m.skills.split(',').map((s) => s.trim()).filter(Boolean),
    }));

    if (catalog.length === 0) {
      return NextResponse.json({ answer: 'В каталоге пока нет мастеров.', recommendations: [], followupQuestion: null });
    }

    const catalogStr = JSON.stringify(catalog.map((m) => ({
      id: m.id, name: m.name, profession: m.profession, category: m.categoryName,
      city: m.city, area: m.area, priceFrom: m.priceFrom, priceTo: m.priceTo,
      rating: m.rating, reviewsCount: m.reviewsCount, verified: m.verified,
      topRated: m.topRated, responseTime: m.responseTime, experienceYears: m.experienceYears, skills: m.skills,
    })), null, 2);

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\nКаталог мастеров:\n' + catalogStr },
    ];
    if (body.history && Array.isArray(body.history)) {
      for (const h of body.history.slice(-6)) {
        messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
      }
    }
    messages.push({ role: 'user', content: userMessage });

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7 }),
    });
    const data = await completion.json();
    const raw = data.choices?.[0]?.message?.content || '';

    let parsed: { answer: string; recommendations: { masterId: string; reason: string }[]; followupQuestion: string | null };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = { answer: raw || 'Не удалось сформировать ответ.', recommendations: [], followupQuestion: null };
    }

    const enriched = (parsed.recommendations || [])
      .map((rec) => {
        const m = catalog.find((x) => x.id === rec.masterId);
        if (!m) return null;
        return { master: { id: m.id, name: m.name, avatar: m.avatar, profession: m.profession, categoryName: m.categoryName, city: m.city, priceFrom: m.priceFrom, priceTo: m.priceTo, currency: m.currency, rating: m.rating, reviewsCount: m.reviewsCount, completedOrders: m.completedOrders, verified: m.verified, topRated: m.topRated, responseTime: m.responseTime, experienceYears: m.experienceYears, skills: m.skills }, reason: rec.reason };
      })
      .filter(Boolean);

    return NextResponse.json({ answer: parsed.answer, recommendations: enriched, followupQuestion: parsed.followupQuestion || null });
  } catch (e) {
    console.error('AI assistant error', e);
    return NextResponse.json({ answer: 'AI-ассистент временно недоступен.', recommendations: [], followupQuestion: null, error: 'ai_unavailable' }, { status: 200 });
  }
}