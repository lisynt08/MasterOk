'use client';

import { categoryIcon, catTone } from '@/lib/categories';
import { Card } from '@/components/ui/card';
import type { CategoryDTO } from '@/lib/types';

interface CategoriesGridProps {
  categories: CategoryDTO[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoriesGrid({ categories, selected, onSelect }: CategoriesGridProps) {
  return (
    <section id="categories" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Категории услуг</h2>
            <p className="mt-1 text-muted-foreground">
              Выберите направление — покажем проверенных мастеров рядом с вами
            </p>
          </div>
          {selected && (
            <button
              onClick={() => onSelect(null)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Сбросить категорию
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon);
            const tone = catTone(c.color);
            const active = selected === c.slug;
            return (
              <Card
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(active ? null : c.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(active ? null : c.slug);
                  }
                }}
                className={`card-hover flex cursor-pointer flex-col gap-3 p-4 ring-1 transition ${
                  active
                    ? 'ring-primary bg-primary/5'
                    : 'ring-transparent hover:ring-primary/30'
                }`}
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.mastersCount}{' '}
                    {pluralize(c.mastersCount, 'мастер', 'мастера', 'мастеров')}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
