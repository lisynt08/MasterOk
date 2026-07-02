'use client';

import { HardHat, Mail, Phone, Shield, Sparkles } from 'lucide-react';

interface SiteFooterProps {
  onOpenAssistant: () => void;
  onNavigate: (page: 'home' | 'orders' | 'reviews') => void;
  onScrollTo: (id: string) => void;
  currentPage: string;
}

export function SiteFooter({ onOpenAssistant, onNavigate, onScrollTo, currentPage }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HardHat className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Мастер<span className="text-primary">Ок</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Маркетплейс проверенных мастеров: сантехники, электрики, ремонт, уборка
              и другие услуги. Заявки напрямую исполнителю, реальные отзывы и рейтинги.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                <Shield className="size-3.5 text-primary" /> Проверенные исполнители
              </span>
              <button
                onClick={onOpenAssistant}
                className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border transition hover:ring-primary/40 hover:text-primary"
              >
                <Sparkles className="size-3.5 text-primary" /> AI-ассистент
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Разделы</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => onScrollTo('categories'), 100);
                  }}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Категории услуг
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => onScrollTo('masters'), 100);
                  }}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Топ-мастера
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Отзывы
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Заявки
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Контакты</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="tel:88000000000"
                  className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                >
                  <Phone className="size-4 text-primary" /> 8 (800) 000-00-00
                </a>
              </li>
              <li>
                <a
                  href="mailto:help@masterok.ru"
                  className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                >
                  <Mail className="size-4 text-primary" /> help@masterok.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center border-t border-border/70 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} МастерОк. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}