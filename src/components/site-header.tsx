'use client';

import * as React from 'react';
import Link from 'next/link';
import { HardHat, Sparkles, Menu, ClipboardList, MessageSquare, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ViewPage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  onOpenAssistant: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onScrollTo: (id: string) => void;
  currentPage: string;
  onNavigate: (page: ViewPage) => void;
  user: { id: string; name: string; email: string; role: string } | null;
}

export function SiteHeader({
  onOpenAssistant,
  onOpenAuth,
  onLogout,
  onScrollTo,
  currentPage,
  onNavigate,
  user,
}: SiteHeaderProps) {
  const navItems = [
    { label: 'Категории', id: 'categories', page: 'home' as ViewPage },
    { label: 'Мастера', id: 'masters', page: 'home' as ViewPage },
    { label: 'Как это работает', id: 'how', page: 'home' as ViewPage },
  ];

  const pageNavItems = [
    { label: 'Заявки', page: 'orders' as ViewPage, icon: ClipboardList },
    { label: 'Отзывы', page: 'reviews' as ViewPage, icon: MessageSquare },
  ];

  function handleNav(item: { id?: string; page: ViewPage }) {
    if (item.page === 'home' && item.id) {
      onScrollTo(item.id);
    } else {
      onNavigate(item.page);
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo — always left */}
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => onNavigate('home')}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HardHat className="size-5" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Мастер<span className="text-primary">Ок</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav — lg+ only */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNav(item)}
              className={cn(
                'text-muted-foreground hover:text-foreground',
                currentPage === 'home' && 'text-foreground'
              )}
            >
              {item.label}
            </Button>
          ))}
          <div className="mx-1 h-5 w-px bg-border" />
          {pageNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <Button
                key={item.page}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNav(item)}
                className={cn(
                  !isActive && 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* AI button — lg+ only */}
        <Button
          onClick={onOpenAssistant}
          className="hidden lg:inline-flex bg-gradient-to-br from-primary to-amber-500 text-primary-foreground"
        >
          <Sparkles className="size-4" />
          AI-подбор
        </Button>

        {/* Auth / User — sm+ */}
        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Выйти">
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuth}
            className="hidden sm:inline-flex"
          >
            <LogIn className="size-4" />
            Войти
          </Button>
        )}

        {/* Mobile menu button — right side, lg:hidden */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Меню">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Меню</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNav(item)}
                >
                  {item.label}
                </Button>
              ))}
              <div className="my-2 h-px bg-border" />
              {pageNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <Button
                    key={item.page}
                    variant={isActive ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => handleNav(item)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                onClick={onOpenAssistant}
                className="mt-2 bg-gradient-to-br from-primary to-amber-500 text-primary-foreground"
              >
                <Sparkles className="size-4" />
                AI-подбор мастера
              </Button>
              <div className="my-2 h-px bg-border" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.role === 'master' ? 'Мастер' : 'Заказчик'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="justify-start text-destructive" onClick={onLogout}>
                    <LogOut className="size-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="justify-start" onClick={onOpenAuth}>
                  <LogIn className="size-4" />
                  Войти
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}