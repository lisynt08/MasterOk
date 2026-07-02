'use client';

import * as React from 'react';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/api';

interface OrderFormProps {
  masterId: string;
  masterName: string;
  prefilledJob?: string;
  onDone?: () => void;
}

export function OrderForm({ masterId, masterName, prefilledJob, onDone }: OrderFormProps) {
  const [clientName, setClientName] = React.useState('');
  const [clientPhone, setClientPhone] = React.useState('');
  const [clientEmail, setClientEmail] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState(prefilledJob || '');
  const [description, setDescription] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const [preferredDate, setPreferredDate] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (prefilledJob) setJobTitle(prefilledJob);
  }, [prefilledJob]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!clientName.trim() || !clientPhone.trim() || !jobTitle.trim() || !description.trim()) {
      toast({ title: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrder({
        masterId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || undefined,
        jobTitle,
        description,
        budget: budget ? Number(budget) : undefined,
        preferredDate: preferredDate || undefined,
        address: address || undefined,
      });
      toast({
        title: 'Заявка отправлена!',
        description: `${masterName} ответит вам в ближайшее время.`,
      });
      setDone(true);
      onDone?.();
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message || 'Не удалось отправить заявку', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="text-lg font-semibold">Заявка принята!</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {masterName} получит вашу заявку и свяжется с вами. Спасибо за использование МастерОк!
        </p>
        <Button variant="outline" onClick={() => { setDone(false); }}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="o-name">Имя *</Label>
          <Input id="o-name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ваше имя" maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="o-phone">Телефон *</Label>
          <Input id="o-phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+7 (___) ___-__-__" inputMode="tel" maxLength={20} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="o-job">Что нужно сделать? *</Label>
        <Input id="o-job" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Кратко опишите задачу" maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="o-desc">Подробное описание *</Label>
        <Textarea
          id="o-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите задачу подробнее: что сломалось/нужно сделать, размеры, материалы, особенности…"
          rows={4}
          maxLength={3000}
        />
        <p className="text-right text-xs text-muted-foreground">{description.length}/3000</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="o-budget">Бюджет, ₽ (необязательно)</Label>
          <Input id="o-budget" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ''))} placeholder="Напр.: 5000" inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="o-date">Удобная дата (необязательно)</Label>
          <Input id="o-date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} placeholder="Напр.: завтра вечером" maxLength={60} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="o-addr">Адрес (необязательно)</Label>
        <Input id="o-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Город, улица, дом" maxLength={300} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="o-email">Email (необязательно)</Label>
        <Input id="o-email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" maxLength={120} />
      </div>

      <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-br from-primary to-amber-500 text-primary-foreground">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Отправить заявку {masterName}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Нажимая «Отправить», вы соглашаетесь на обработку персональных данных
      </p>
    </form>
  );
}
