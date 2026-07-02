'use client';

import * as React from 'react';
import {
  Loader2,
  MapPin,
  Clock,
  Briefcase,
  BadgeCheck,
  Star,
  Award,
  Languages,
  ThumbsUp,
  ThumbsDown,
  Quote,
  Send,
  LogIn,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Stars } from '@/components/stars';
import { ReviewForm } from '@/components/review-form';
import { OrderForm } from '@/components/order-form';
import { catTone, formatPrice } from '@/lib/categories';
import { fetchMaster } from '@/lib/api';
import type { MasterDetailDTO, ReviewDTO } from '@/lib/types';

interface MasterDialogProps {
  masterId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: 'about' | 'reviews' | 'order';
  prefilledJob?: string;
  onReviewSubmitted?: (review: any, rating: number, count: number) => void;
  isAuthed?: boolean;
  onRequireAuth?: () => void;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  if (days < 365) return `${Math.floor(days / 30)} мес. назад`;
  return `${Math.floor(days / 365)} г. назад`;
}

export function MasterDialog({
  masterId,
  open,
  onOpenChange,
  defaultTab = 'about',
  prefilledJob,
  onReviewSubmitted,
  isAuthed = false,
  onRequireAuth,
}: MasterDialogProps) {
  const [master, setMaster] = React.useState<MasterDetailDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState(defaultTab);
  const [reviews, setReviews] = React.useState<ReviewDTO[]>([]);

  React.useEffect(() => {
    if (defaultTab) setTab(defaultTab);
  }, [defaultTab]);

  React.useEffect(() => {
    if (!open || !masterId) return;
    setLoading(true);
    setError(null);
    setMaster(null);
    fetchMaster(masterId)
      .then((r) => {
        setMaster(r.master);
        setReviews(r.master.reviews);
      })
      .catch((e) => setError(e.message || 'Не удалось загрузить профиль'))
      .finally(() => setLoading(false));
  }, [open, masterId]);

  function handleReviewSubmitted(review: ReviewDTO, rating: number, count: number) {
    setReviews((prev) => [review, ...prev]);
    setMaster((m) => (m ? { ...m, rating, reviewsCount: count, reviews: [review, ...m.reviews] } : m));
    onReviewSubmitted?.(review, rating, count);
  }

  const tone = master ? catTone(master.categoryColor) : catTone('emerald');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {master ? `Профиль мастера: ${master.name}` : 'Профиль мастера'}
          </DialogTitle>
          <DialogDescription>Подробная информация, отзывы и форма заявки</DialogDescription>
        </DialogHeader>

        {loading && <MasterSkeleton />}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Закрыть</Button>
          </div>
        )}

        {master && !loading && (
          <div className="flex max-h-[92vh] flex-col">
            {/* Header */}
            <div className="relative shrink-0 border-b border-border bg-gradient-to-br from-secondary/60 to-background p-5 sm:p-6">
              <div className={`absolute inset-x-0 top-0 h-1.5 ${tone.dot}`} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="size-20 shrink-0 ring-2 ring-background shadow-md">
                  <AvatarImage src={master.avatar} alt={master.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {master.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold leading-tight sm:text-2xl">{master.name}</h2>
                    {master.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <BadgeCheck className="size-3.5" /> Проверен
                      </span>
                    )}
                    {master.topRated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        <Award className="size-3.5" /> Топ-мастер
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{master.profession}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <Stars rating={master.rating} showValue count={master.reviewsCount} />
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{master.completedOrders} заказов закрыто</span>
                  </div>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <Button
                    className="bg-gradient-to-br from-primary to-amber-500 text-primary-foreground"
                    onClick={() => setTab('order')}
                  >
                    <Send className="size-4" /> Оставить заявку
                  </Button>
                </div>
              </div>

              {/* Quick facts */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Fact icon={<MapPin className="size-4" />} label="Город" value={master.city} />
                <Fact icon={<Clock className="size-4" />} label="Отвечает" value={master.responseTime} />
                <Fact icon={<Briefcase className="size-4" />} label="Опыт" value={`${master.experienceYears} лет`} />
                <Fact icon={<Star className="size-4" />} label="Цена" value={formatPrice(master.priceFrom, master.priceTo, master.currency)} />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-border px-3 sm:px-5">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    О мастере
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    Отзывы ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger value="order" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    Заявка
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="scroll-area-thin min-h-0 flex-1">
                <TabsContent value="about" className="m-0 p-5 sm:p-6">
                  <div className="space-y-5">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">О мастере</h3>
                      <p className="text-sm leading-relaxed">{master.bio}</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Навыки и услуги</h3>
                      <div className="flex flex-wrap gap-2">
                        {master.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow icon={<MapPin className="size-4" />} label="Район выезда" value={master.area || master.city} />
                      <InfoRow icon={<Languages className="size-4" />} label="Языки" value={master.languages} />
                      <InfoRow icon={<Briefcase className="size-4" />} label="Опыт работы" value={`${master.experienceYears} лет`} />
                      <InfoRow icon={<Star className="size-4" />} label="Стоимость" value={formatPrice(master.priceFrom, master.priceTo, master.currency)} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="m-0 p-5 sm:p-6">
                  <div className="space-y-5">
                    {/* Rating summary */}
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{master.rating.toFixed(1)}</p>
                        <Stars rating={master.rating} size={14} className="mt-1 justify-center" />
                        <p className="mt-1 text-xs text-muted-foreground">{master.reviewsCount} отзывов</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((r) => r.rating === star).length;
                          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-muted-foreground">{star}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-6 text-right tabular-nums text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review form */}
                    {isAuthed ? (
                      <details className="group rounded-xl border border-border">
                        <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-medium">
                          Оставить отзыв
                          <span className="text-muted-foreground transition group-open:rotate-180">▾</span>
                        </summary>
                        <div className="border-t border-border p-4">
                          <ReviewForm masterId={master.id} onSubmitted={handleReviewSubmitted} />
                        </div>
                      </details>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-center">
                        <LogIn className="size-5 shrink-0 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Войдите, чтобы оставить отзыв</p>
                          <button onClick={onRequireAuth} className="text-xs text-primary hover:underline">
                            Войти / Зарегистрироваться
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reviews list */}
                    <div className="space-y-3">
                      {reviews.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Пока нет отзывов. Будьте первым!
                        </p>
                      ) : (
                        reviews.map((r) => <ReviewItem key={r.id} review={r} />)
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="order" className="m-0 p-5 sm:p-6">
                  <div className="mx-auto max-w-xl">
                    <h3 className="text-lg font-semibold">Заявка мастеру</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Заполните форму — {master.name} получит заявку и свяжется с вами в течение часа.
                    </p>
                    <div className="mt-4">
                      {isAuthed ? (
                        <OrderForm masterId={master.id} masterName={master.name} prefilledJob={prefilledJob} />
                      ) : (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
                          <Send className="size-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Войдите, чтобы отправить заявку</p>
                          <p className="max-w-xs text-xs text-muted-foreground">
                            Для взаимодействия с мастерами необходима регистрация
                          </p>
                          <Button onClick={onRequireAuth}>
                            <LogIn className="size-4" />
                            Войти
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: ReviewDTO }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-[10px] font-semibold">
              {review.authorName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{review.authorName}</p>
        </div>
        <Stars rating={review.rating} size={12} />
        {review.jobTitle && (
          <span className="text-xs text-muted-foreground">· {review.jobTitle}</span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Quote className="size-4 shrink-0 text-muted-foreground/50" />
        <p className="text-sm leading-relaxed">{review.text}</p>
      </div>
      {(review.pros || review.cons) && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {review.pros && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-2 text-xs dark:bg-emerald-500/10">
              <ThumbsUp className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">Плюсы</p>
                <p className="text-foreground/80">{review.pros}</p>
              </div>
            </div>
          )}
          {review.cons && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2 text-xs dark:bg-rose-500/10">
              <ThumbsDown className="mt-0.5 size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-medium text-rose-700 dark:text-rose-300">Минусы</p>
                <p className="text-foreground/80">{review.cons}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MasterSkeleton() {
  return (
    <div className="p-6">
      <div className="flex gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
