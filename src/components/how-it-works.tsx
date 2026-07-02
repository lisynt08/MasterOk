'use client';

import { Search, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const STEPS = [
  {
    icon: Search,
    title: 'Опишите задачу',
    desc: 'Выберите категорию или воспользуйтесь поиском. AI-ассистент поможет сформулировать запрос.',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    icon: Send,
    title: 'Отправьте заявку',
    desc: 'Опишите задачу, укажите бюджет и удобное время. Заявка уходит напрямую выбранному мастеру.',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    icon: MessageSquare,
    title: 'Обсудите детали',
    desc: 'Мастер отвечает в течение часа. Уточняйте сроки, стоимость и материалы напрямую.',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    icon: CheckCircle2,
    title: 'Оставьте отзыв',
    desc: 'После выполнения работы поставьте оценку и напишите отзыв — это помогает другим.',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Как это работает</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Четыре простых шага от заявки до выполненной работы
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="relative flex flex-col gap-4 p-5">
                <span className="absolute right-4 top-4 text-3xl font-bold text-muted/60 tabular-nums">
                  {i + 1}
                </span>
                <span className={`flex size-12 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
