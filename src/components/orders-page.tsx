'use client';

import * as React from 'react';
import {
  Clock,
  MapPin,
  Send,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Briefcase,
  User,
  Bot,
  ArrowLeft,
  CalendarDays,
  Banknote,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchOrdersList, fetchChatHistory, sendChatMessage } from '@/lib/api';
import { joinOrderRoom, leaveOrderRoom, onNewMessage, sendMessage } from '@/lib/socket';
import type { OrderListDTO, ChatMessageDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'Новая', color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  viewed: { label: 'Просмотрена', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  accepted: { label: 'Принята', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  declined: { label: 'Отклонена', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  completed: { label: 'Завершена', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
};

interface OrdersPageProps {
  onBack: () => void;
}

export function OrdersPage({ onBack }: OrdersPageProps) {
  const [orders, setOrders] = React.useState<OrderListDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
  const [chatMessages, setChatMessages] = React.useState<ChatMessageDTO[]>([]);
  const [chatLoading, setChatLoading] = React.useState(false);
  const [chatInput, setChatInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchOrdersList()
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Socket.io listener
  React.useEffect(() => {
    const unsub = onNewMessage((msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsub;
  }, []);

  async function openChat(order: OrderListDTO) {
    if (expandedOrder === order.id) {
      setExpandedOrder(null);
      leaveOrderRoom(order.id);
      return;
    }
    if (expandedOrder) {
      leaveOrderRoom(expandedOrder);
    }
    setExpandedOrder(order.id);
    setChatLoading(true);
    setChatMessages([]);
    try {
      const res = await fetchChatHistory(order.id);
      setChatMessages(res.messages);
      joinOrderRoom(order.id);
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSend(order: OrderListDTO) {
    const text = chatInput.trim();
    if (!text || sending) return;
    setSending(true);
    setChatInput('');
    try {
      const res = await sendChatMessage({
        orderId: order.id,
        masterId: order.masterId,
        sender: 'client',
        text,
      });
      // Also broadcast via socket.io
      sendMessage(order.id, res.message);
      setChatMessages((prev) => [...prev, res.message]);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  function timeAgo(iso: string) {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч. назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString('ru-RU');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Мои заявки</h1>
          <p className="text-sm text-muted-foreground">Все заявки к мастерам и переписка</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Briefcase className="size-7 text-muted-foreground" />
          </span>
          <h3 className="text-lg font-semibold">Заявок пока нет</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Выберите мастера из каталога и отправьте ему заявку — она появится здесь.
          </p>
          <Button onClick={onBack}>Перейти к каталогу</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.new;
            const isExpanded = expandedOrder === order.id;
            const initials = order.master.name
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order header */}
                <button
                  onClick={() => openChat(order)}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-secondary/50"
                >
                  <Avatar className="size-11 shrink-0 ring-1 ring-border">
                    <AvatarImage src={order.master.avatar} alt={order.master.name} />
                    <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{order.jobTitle}</h3>
                      <Badge variant="secondary" className={cn('shrink-0 text-xs', st.color)}>
                        {st.label}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {order.master.name} · {order.master.profession}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {timeAgo(order.createdAt)}
                      </span>
                      {order.budget && (
                        <span className="flex items-center gap-1">
                          <Banknote className="size-3" />
                          {order.budget.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Order details */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/30">
                    <div className="grid gap-3 p-4 text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Адрес</p>
                          <p>{order.address || 'Не указан'}</p>
                        </div>
                      </div>
                      {order.preferredDate && (
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Удобная дата</p>
                            <p>{order.preferredDate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border p-4">
                      <p className="mb-3 text-xs font-medium text-muted-foreground">Описание задачи</p>
                      <p className="text-sm leading-relaxed">{order.description}</p>
                    </div>

                    {/* Chat area */}
                    <div className="border-t border-border">
                      <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
                        <MessageSquare className="size-4" />
                        Чат с мастером
                      </div>
                      <div className="h-64 overflow-y-auto px-4 scroll-area-thin">
                        {chatLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                            <MessageSquare className="size-6" />
                            <p>Нет сообщений. Напишите мастеру!</p>
                          </div>
                        ) : (
                          <div className="space-y-3 py-2">
                            {chatMessages.map((msg) => {
                              const isClient = msg.sender === 'client';
                              return (
                                <div key={msg.id} className={cn('flex gap-2', isClient && 'flex-row-reverse')}>
                                  <span
                                    className={cn(
                                      'flex size-7 shrink-0 items-center justify-center rounded-full',
                                      isClient
                                        ? 'bg-secondary text-muted-foreground'
                                        : 'bg-gradient-to-br from-primary to-amber-500 text-primary-foreground'
                                    )}
                                  >
                                    {isClient ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                                  </span>
                                  <div
                                    className={cn(
                                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                                      isClient
                                        ? 'rounded-tr-sm bg-primary text-primary-foreground'
                                        : 'rounded-tl-sm bg-card text-foreground ring-1 ring-border'
                                    )}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={chatEndRef} />
                          </div>
                        )}
                      </div>
                      <div className="border-t border-border p-3">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSend(order);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Напишите сообщение мастеру…"
                            disabled={sending}
                            maxLength={5000}
                            className="h-10"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={sending || !chatInput.trim()}
                            className="h-10 w-10 shrink-0"
                          >
                            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}