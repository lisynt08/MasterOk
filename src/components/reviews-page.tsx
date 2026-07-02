'use client';

import * as React from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Quote,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Check,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stars } from '@/components/stars';
import { fetchMasterReviews, fetchServiceReviews, createServiceReview } from '@/lib/api';
import { catTone } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';
import type { ReviewWithMasterDTO, ServiceReviewDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ReviewsPageProps {
  onBack: () => void;
}

export function ReviewsPage({ onBack }: ReviewsPageProps) {
  const [tab, setTab] = React.useState<'masters' | 'service'>('masters');
  const [masterReviews, setMasterReviews] = React.useState<ReviewWithMasterDTO[]>([]);
  const [serviceReviews, setServiceReviews] = React.useState<ServiceReviewDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchMasterReviews(), fetchServiceReviews()])
      .then(([mr, sr]) => {
        setMasterReviews(mr.reviews);
        setServiceReviews(sr.reviews);
      })
      .catch(() => {
        setMasterReviews([]);
        setServiceReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleServiceReviewAdded(review: ServiceReviewDTO) {
    setServiceReviews((prev) => [review, ...prev]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Отзывы</h1>
          <p className="text-sm text-muted-foreground">
            {masterReviews.length + serviceReviews.length} отзывов всего
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'masters' | 'service')} className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="masters" className="flex-1 sm:flex-initial">
            <Star className="mr-1.5 size-4" />
            Отзывы о мастерах
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {masterReviews.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="service" className="flex-1 sm:flex-initial">
            <MessageSquare className="mr-1.5 size-4" />
            Отзывы о сервисе
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {serviceReviews.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="masters">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : masterReviews.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <Star className="size-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Пока нет отзывов о мастерах</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Откройте профиль мастера и оставьте первый отзыв!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {masterReviews.map((review) => (
                <MasterReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="service">
          <ServiceReviewForm onSubmitted={handleServiceReviewAdded} />

          {loading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : serviceReviews.length === 0 ? (
            <Card className="mt-6 flex flex-col items-center justify-center gap-3 p-12 text-center">
              <MessageSquare className="size-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Пока нет отзывов о сервисе</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Поделитесь своим впечатлением от платформы МастерОк!
              </p>
            </Card>
          ) : (
            <div className="mt-6 space-y-4">
              {serviceReviews.map((review) => (
                <ServiceReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MasterReviewCard({ review }: { review: ReviewWithMasterDTO }) {
  const tone = catTone(review.master.category?.color || 'emerald');
  const initials = review.master.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const authorInitials = review.authorName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-secondary text-xs font-semibold">{authorInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium">{review.authorName}</p>
            <Stars rating={review.rating} size={12} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {review.jobTitle && <span>· {review.jobTitle}</span>}
            <span>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
        {/* Master badge */}
        <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
          <Avatar className="size-6 ring-1 ring-border">
            <AvatarImage src={review.master.avatar} alt={review.master.name} />
            <AvatarFallback className="text-[8px] font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium leading-tight">{review.master.name}</p>
            <span className={cn('text-[10px] font-medium', tone.text)}>
              {review.master.category?.name}
            </span>
          </div>
        </div>
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
    </Card>
  );
}

function ServiceReviewCard({ review }: { review: ServiceReviewDTO }) {
  const authorInitials = review.authorName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-secondary text-xs font-semibold">{authorInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium">{review.authorName}</p>
            <Stars rating={review.rating} size={12} />
          </div>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
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
    </Card>
  );
}

function ServiceReviewForm({ onSubmitted }: { onSubmitted: (review: ServiceReviewDTO) => void }) {
  const [authorName, setAuthorName] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [text, setText] = React.useState('');
  const [pros, setPros] = React.useState('');
  const [cons, setCons] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!authorName.trim()) {
      toast({ title: 'Укажите имя', variant: 'destructive' });
      return;
    }
    if (text.trim().length < 10) {
      toast({ title: 'Слишком короткий отзыв', description: 'Минимум 10 символов', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createServiceReview({
        authorName,
        rating,
        text,
        pros: pros || undefined,
        cons: cons || undefined,
      });
      toast({ title: 'Отзыв опубликован', description: 'Спасибо за вашу оценку!' });
      onSubmitted(res.review);
      setAuthorName('');
      setText('');
      setPros('');
      setCons('');
      setRating(5);
      setOpen(false);
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message || 'Не удалось отправить отзыв', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const display = hoverRating || rating;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-medium transition hover:bg-secondary/50"
      >
        Оставить отзыв о сервисе МастерОк
        <span className={cn('text-muted-foreground transition', open && 'rotate-180')}>▾</span>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ваша оценка</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseEnter={() => setHoverRating(v)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(v)}
                    className="rounded p-0.5 transition hover:scale-110"
                    aria-label={`${v} звёзд`}
                  >
                    <Star
                      className={cn(
                        'size-7 transition',
                        v <= display ? 'fill-amber-400 text-amber-400' : 'text-amber-400/30'
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium">{display}.0</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="srv-name">Ваше имя *</Label>
              <Input
                id="srv-name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Как вас зовут?"
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="srv-text">Отзыв о сервисе *</Label>
              <Textarea
                id="srv-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Расскажите о вашем опыте использования платформы МастерОк…"
                rows={4}
                maxLength={2000}
              />
              <p className="text-right text-xs text-muted-foreground">{text.length}/2000</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="srv-pros" className="text-emerald-600 dark:text-emerald-400">Плюсы</Label>
                <Input
                  id="srv-pros"
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="Что понравилось?"
                  maxLength={300}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="srv-cons" className="text-rose-600 dark:text-rose-400">Минусы</Label>
                <Input
                  id="srv-cons"
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="Что можно улучшить?"
                  maxLength={300}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Опубликовать отзыв
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}