'use client';

import * as React from 'react';
import { Filter, Loader2, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MasterCard } from '@/components/master-card';
import type { MasterListItemDTO, MastersQuery } from '@/lib/types';
import { fetchMasters } from '@/lib/api';

interface MastersSectionProps {
  search: string;
  category: string | null;
  onOpenMaster: (id: string) => void;
  registerRef: (el: HTMLElement | null) => void;
}

const SORT_OPTIONS: { value: MastersQuery['sort']; label: string }[] = [
  { value: 'rating', label: 'По рейтингу' },
  { value: 'reviews', label: 'По числу отзывов' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'newest', label: 'Новые' },
];

const MAX_PRICE_LIMIT = 500000;

export function MastersSection({ search, category, onOpenMaster, registerRef }: MastersSectionProps) {
  const [sort, setSort] = React.useState<MastersQuery['sort']>('rating');
  const [minRating, setMinRating] = React.useState(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(MAX_PRICE_LIMIT);
  const [verifiedOnly, setVerifiedOnly] = React.useState(false);
  const [topRatedOnly, setTopRatedOnly] = React.useState(false);
  const [masters, setMasters] = React.useState<MasterListItemDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Debounced fetch
  React.useEffect(() => {
    const q: MastersQuery = {
      category: category || undefined,
      search: search || undefined,
      sort,
      minRating: minRating > 0 ? String(minRating) : undefined,
      maxPrice: maxPrice < MAX_PRICE_LIMIT ? String(maxPrice) : undefined,
      verifiedOnly: verifiedOnly ? 'true' : undefined,
      topRatedOnly: topRatedOnly ? 'true' : undefined,
    };
    setLoading(true);
    const t = setTimeout(() => {
      fetchMasters(q)
        .then((r) => setMasters(r.masters))
        .catch(() => setMasters([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [category, search, sort, minRating, maxPrice, verifiedOnly, topRatedOnly]);

  const activeFiltersCount =
    (minRating > 0 ? 1 : 0) +
    (maxPrice < MAX_PRICE_LIMIT ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (topRatedOnly ? 1 : 0);

  function resetFilters() {
    setMinRating(0);
    setMaxPrice(MAX_PRICE_LIMIT);
    setVerifiedOnly(false);
    setTopRatedOnly(false);
  }

  const FiltersContent = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Фильтры</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Минимальный рейтинг</Label>
            <div className="flex items-center gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={minRating === r ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setMinRating(r)}
                >
                  {r === 0 ? 'Любой' : `${r}+`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Макс. цена от</Label>
              <span className="text-xs font-medium tabular-nums">
                {maxPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <Slider
              value={[maxPrice]}
              min={1000}
              max={MAX_PRICE_LIMIT}
              step={1000}
              onValueChange={(v) => setMaxPrice(v[0])}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-sm font-medium">Только проверенные</Label>
                <p className="text-xs text-muted-foreground">С подтверждёнными документами</p>
              </div>
              <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-sm font-medium">Топ-мастера</Label>
                <p className="text-xs text-muted-foreground">С высоким рейтингом</p>
              </div>
              <Switch checked={topRatedOnly} onCheckedChange={setTopRatedOnly} />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
              <X className="size-4" /> Сбросить фильтры ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="masters" ref={registerRef} className="scroll-mt-20 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Каталог мастеров</h2>
            <p className="mt-1 text-muted-foreground">
              {loading
                ? 'Загружаем мастеров…'
                : `Найдено ${masters.length} ${pluralRu(masters.length, 'мастер', 'мастера', 'мастеров')}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowMobileFilters((s) => !s)}
            >
              <SlidersHorizontal className="size-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs">{activeFiltersCount}</Badge>
              )}
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as MastersQuery['sort'])}>
              <SelectTrigger size="sm" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value!}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-20 p-5">{FiltersContent}</Card>
          </aside>

          {/* Mobile filters */}
          {showMobileFilters && (
            <Card className="p-5 lg:hidden">{FiltersContent}</Card>
          )}

          {/* Grid */}
          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : masters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {masters.map((m) => (
                  <MasterCard key={m.id} master={m} onOpen={onOpenMaster} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <SearchX className="size-7 text-muted-foreground" />
      </span>
      <h3 className="text-lg font-semibold">Ничего не нашлось</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Попробуйте изменить фильтры, сбросить категорию или спросить у AI-ассистента —
        он подберёт мастера под вашу задачу.
      </p>
    </Card>
  );
}

function pluralRu(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
