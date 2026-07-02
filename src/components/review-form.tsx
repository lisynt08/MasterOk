'use client';

import * as React from 'react';
import { Loader2, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createReview } from '@/lib/api';
import type { ReviewDTO } from '@/lib/types';

interface ReviewFormProps {
  masterId: string;
  onSubmitted: (review: ReviewDTO, rating: number, count: number) => void;
}

export function ReviewForm({ masterId, onSubmitted }: ReviewFormProps) {
  const [authorName, setAuthorName] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [text, setText] = React.useState('');
  const [pros, setPros] = React.useState('');
  const [cons, setCons] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
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
      const res = await createReview({
        masterId,
        authorName,
        rating,
        text,
        pros: pros || undefined,
        cons: cons || undefined,
        jobTitle: jobTitle || undefined,
      });
      toast({ title: 'Отзыв опубликован', description: 'Спасибо за вашу оценку!' });
      onSubmitted(res.review, res.masterRating, res.masterReviewsCount);
      setAuthorName(''); setText(''); setPros(''); setCons(''); setJobTitle(''); setRating(5);
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось отправить отзыв', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const display = hoverRating || rating;

  return (
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rv-name">Ваше имя *</Label>
          <Input
            id="rv-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Как вас зовут?"
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rv-job">Какая работа была выполнена?</Label>
          <Input
            id="rv-job"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Напр.: установка смесителя"
            maxLength={120}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rv-text">Отзыв *</Label>
        <Textarea
          id="rv-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Расскажите о качестве работы, сроках и впечатлениях…"
          rows={4}
          maxLength={2000}
        />
        <p className="text-right text-xs text-muted-foreground">{text.length}/2000</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rv-pros" className="text-emerald-600 dark:text-emerald-400">Плюсы</Label>
          <Input
            id="rv-pros"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="Что понравилось?"
            maxLength={300}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rv-cons" className="text-rose-600 dark:text-rose-400">Минусы</Label>
          <Input
            id="rv-cons"
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
  );
}
