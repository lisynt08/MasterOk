'use client';

import * as React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MasterCard } from '@/components/master-card';
import { fetchMasters } from '@/lib/api';
import type { MasterListItemDTO } from '@/lib/types';

interface FeaturedMastersProps {
  onOpenMaster: (id: string) => void;
  onScrollToCatalog: () => void;
}

export function FeaturedMasters({ onOpenMaster, onScrollToCatalog }: FeaturedMastersProps) {
  const [masters, setMasters] = React.useState<MasterListItemDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMasters({ topRatedOnly: 'true', sort: 'rating', top: '3' })
      .then((r) => setMasters(r.masters))
      .catch(() => setMasters([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-y border-border/70 bg-gradient-to-b from-secondary/40 to-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Award className="size-3.5" /> Топ-мастера
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Рекомендуют клиенты
            </h2>
            <p className="mt-1 text-muted-foreground">
              Исполнители с самым высоким рейтингом и сотнями завершённых заказов
            </p>
          </div>
          <Button variant="outline" className="hidden shrink-0 sm:inline-flex" onClick={onScrollToCatalog}>
            Все мастера
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
            : masters.map((m) => <MasterCard key={m.id} master={m} onOpen={onOpenMaster} />)}
        </div>
      </div>
    </section>
  );
}
