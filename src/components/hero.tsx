'use client';

import * as React from 'react';
import { Search, Sparkles, ShieldCheck, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroProps {
  search: string;
  onSearch: (v: string) => void;
  onOpenAssistant: () => void;
  onScrollTo: (id: string) => void;
  stats: { masters: number; categories: number; reviews: number; completedOrders: number } | null;
}

export function Hero({ search, onSearch, onOpenAssistant, onScrollTo, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: copy + search */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
              <Sparkles className="size-3.5 text-primary" />
              AI-ассистент подберёт мастера за вас
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Проверенные мастера{' '}
              <span className="bg-gradient-to-br from-primary to-amber-500 bg-clip-text text-transparent">
                для любых задач
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Сантехника, электрика, ремонт квартир, уборка, мебель на заказ и не только.
              Реальные отзывы, рейтинги и заявки напрямую исполнителю — без посредников.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Что нужно сделать? Напр.: «починить кран»"
                  className="h-12 pl-9 text-base shadow-sm"
                  aria-label="Поиск услуги"
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-6"
                onClick={() => onScrollTo('masters')}
              >
                <Search className="size-4" />
                Найти мастера
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAssistant}
                className="bg-gradient-to-br from-primary/10 to-amber-500/10"
              >
                <Sparkles className="size-4 text-primary" />
                Подобрать через AI
              </Button>
              <span className="text-xs text-muted-foreground">
                или выберите категорию ниже
              </span>
            </div>

            {stats && (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat icon={<Users className="size-4" />} value={stats.masters} label="мастеров" />
                <Stat icon={<Star className="size-4" />} value={stats.reviews} label="отзывов" />
                <Stat icon={<ShieldCheck className="size-4" />} value={stats.completedOrders} label="заказов закрыто" />
                <Stat icon={<Sparkles className="size-4" />} value={stats.categories} label="категорий" />
              </div>
            )}
          </div>

          {/* Right: hero image */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <img
                src="/hero.png"
                alt="Мастера за работой"
                className="aspect-[16/9] w-full object-cover"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-5 -left-3 hidden w-56 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Гарантия качества</p>
                  <p className="text-xs text-muted-foreground">Проверка документов</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 right-4 hidden w-48 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:block">
              <p className="text-xs text-muted-foreground">Средний рейтинг</p>
              <p className="text-2xl font-bold text-primary">4.9 / 5.0</p>
              <p className="text-xs text-muted-foreground">по {stats?.reviews ?? '—'} отзывам</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3">
      <div className="flex items-center gap-1.5 text-primary">
        {icon}
        <span className="text-xl font-bold tabular-nums text-foreground">
          {value.toLocaleString('ru-RU')}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}