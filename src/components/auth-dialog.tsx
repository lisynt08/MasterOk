'use client';

import * as React from 'react';
import { Loader2, LogIn, UserPlus, HardHat, ShoppingCart, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLogin: (user: { id: string; name: string; email: string; role: string; masterId?: string | null }) => void;
  categories: { id: string; name: string }[];
}

export function AuthDialog({ open, onOpenChange, onLogin, categories }: AuthDialogProps) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [loading, setLoading] = React.useState(false);

  // Reset to login when dialog opens
  React.useEffect(() => {
    if (open) setMode('login');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</DialogTitle>
          <DialogDescription>Войдите или создайте аккаунт</DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          <LoginForm
            loading={loading}
            setLoading={setLoading}
            onLogin={(u) => { onLogin(u); onOpenChange(false); }}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            loading={loading}
            setLoading={setLoading}
            onLogin={(u) => { onLogin(u); onOpenChange(false); }}
            onSwitchToLogin={() => setMode('login')}
            categories={categories}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({
  loading,
  setLoading,
  onLogin,
  onSwitchToRegister,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: `Добро пожаловать, ${data.user.name}!` });
      onLogin(data.user);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <LogIn className="size-6" />
        </span>
      </div>
      <h2 className="text-center text-xl font-bold">Вход в аккаунт</h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Войдите, чтобы взаимодействовать с мастерами
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-pass">Пароль</Label>
          <Input
            id="auth-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Войти
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Зарегистрироваться
        </button>
      </p>
    </div>
  );
}

function RegisterForm({
  loading,
  setLoading,
  onLogin,
  onSwitchToLogin,
  categories,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onLogin: (user: any) => void;
  onSwitchToLogin: () => void;
  categories: { id: string; name: string }[];
}) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<'client' | 'master'>('client');
  // Master-specific fields
  const [profession, setProfession] = React.useState('');
  const [skills, setSkills] = React.useState('');
  const [city, setCity] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [bio, setBio] = React.useState('');
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: 'Заполните имя, email и пароль', variant: 'destructive' });
      return;
    }
    if (role === 'master' && (!profession.trim() || !city.trim() || !categoryId)) {
      toast({ title: 'Заполните профессию, город и категорию', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const body: any = { name, email, password, phone, role };
      if (role === 'master') {
        body.profession = profession;
        body.skills = skills;
        body.city = city;
        body.categoryId = categoryId;
        body.bio = bio;
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: `Добро пожаловать, ${data.user.name}!`, description: role === 'master' ? 'Ваш профиль мастера создан' : undefined });
      onLogin(data.user);
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6 scroll-area-thin">
      <button
        onClick={onSwitchToLogin}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад ко входу
      </button>

      <h2 className="text-xl font-bold">Регистрация</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Создайте аккаунт, чтобы взаимодействовать с мастерами
      </p>

      {/* Role selector */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('client')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition',
            role === 'client'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          )}
        >
          <span className={cn(
            'flex size-10 items-center justify-center rounded-full',
            role === 'client' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          )}>
            <ShoppingCart className="size-5" />
          </span>
          <span className="text-sm font-medium">Заказчик</span>
          <span className="text-xs text-muted-foreground">Ищу мастера</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('master')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition',
            role === 'master'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          )}
        >
          <span className={cn(
            'flex size-10 items-center justify-center rounded-full',
            role === 'master' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          )}>
            <HardHat className="size-5" />
          </span>
          <span className="text-sm font-medium">Мастер</span>
          <span className="text-xs text-muted-foreground">Предлагаю услуги</span>
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Ваше имя *</Label>
          <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как вас зовут?" maxLength={80} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email *</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-pass">Пароль *</Label>
            <Input id="reg-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 4 символа" autoComplete="new-password" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-phone">Телефон</Label>
          <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" inputMode="tel" maxLength={20} />
        </div>

        {/* Master-specific fields */}
        {role === 'master' && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg-prof">Профессия *</Label>
                <Input id="reg-prof" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Напр.: Сантехник" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-city">Город *</Label>
                <Input id="reg-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Напр.: Москва" maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-cat">Категория услуг *</Label>
              <select
                id="reg-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-skills">Навыки (через запятую)</Label>
              <Input id="reg-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Напр.: монтаж труб, ремонт смесителей" maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-bio">О себе</Label>
              <Textarea id="reg-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Расскажите о своём опыте..." rows={3} maxLength={1000} />
            </div>
          </>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {role === 'master' ? 'Зарегистрироваться как мастер' : 'Зарегистрироваться'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Войти
        </button>
      </p>
    </div>
  );
}