'use client';

import { MapPin, Clock, BadgeCheck, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Stars } from '@/components/stars';
import { catTone, formatPrice } from '@/lib/categories';
import type { MasterListItemDTO } from '@/lib/types';

interface MasterCardProps {
  master: MasterListItemDTO;
  onOpen: (id: string) => void;
}

export function MasterCard({ master, onOpen }: MasterCardProps) {
  const tone = catTone(master.categoryColor);
  const initials = master.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(master.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(master.id);
        }
      }}
      className="card-hover group relative flex cursor-pointer flex-col gap-4 overflow-hidden p-0 ring-1 ring-transparent hover:ring-primary/30 focus-visible:ring-primary/40"
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${tone.dot}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="size-14 ring-2 ring-background shadow-sm">
              <AvatarImage src={master.avatar} alt={master.name} />
              <AvatarFallback className="bg-secondary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {master.topRated && (
              <span
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-400 text-white shadow ring-2 ring-background"
                title="Топ-мастер"
              >
                <Star className="size-3.5 fill-white" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold leading-tight">{master.name}</h3>
              {master.verified && (
                <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Проверен" />
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">{master.profession}</p>
            <Stars rating={master.rating} count={master.reviewsCount} className="mt-1" size={14} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            <span className={`size-1.5 rounded-full ${tone.dot}`} />
            {master.categoryName}
          </span>
          {master.skills.slice(0, 2).map((s) => (
            <Badge key={s} variant="secondary" className="font-normal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            <span className="truncate">{master.city}{master.area ? ` · ${master.area}` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>Отвечает {master.responseTime}</span>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Стоимость работ</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(master.priceFrom, master.priceTo, master.currency)}
            </p>
          </div>
          <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
            Профиль
            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
