'use client';

import * as React from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Stars } from '@/components/stars';
import { cn } from '@/lib/utils';
import { askAssistant, type AiRecommendation } from '@/lib/api';

interface AiAssistantProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPickMaster: (id: string, prefilledJob?: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AiRecommendation[];
  followupQuestion?: string | null;
}

const SUGGESTIONS = [
  'Нужно починить протекающий кран на кухне',
  'Ищу электрика для замены проводки в квартире',
  'Помоги найти мастера для уборки после ремонта',
  'Хочу сделать кухонный гарнитур на заказ',
];

const STARTER_MESSAGE: Message = {
  id: 'starter',
  role: 'assistant',
  content:
    'Привет! Я AI-ассистент «МастерОк». Опишите вашу задачу — подберу подходящего мастера из каталога, объясню почему он подходит, и вы сможете сразу отправить ему заявку.',
  recommendations: [],
  followupQuestion: null,
};

export function AiAssistant({ open, onOpenChange, onPickMaster }: AiAssistantProps) {
  const [messages, setMessages] = React.useState<Message[]>([STARTER_MESSAGE]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { id: cryptoId(), role: 'user', content };
    const history = messages
      .filter((m) => m.id !== 'starter')
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await askAssistant(content, history);
      setMessages((prev) => [
        ...prev,
        {
          id: cryptoId(),
          role: 'assistant',
          content: res.answer,
          recommendations: res.recommendations,
          followupQuestion: res.followupQuestion,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: cryptoId(),
          role: 'assistant',
          content: 'Извините, не удалось получить ответ. Попробуйте ещё раз.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([STARTER_MESSAGE]);
    setInput('');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-background/40 p-0 backdrop-blur-sm sm:p-4">
      {/* Backdrop for mobile */}
      <div className="absolute inset-0 sm:hidden" onClick={() => onOpenChange(false)} />
      <div className="relative flex h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:h-[640px] sm:max-h-[85vh] sm:w-[420px] sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-gradient-to-br from-primary to-amber-500 p-4 text-primary-foreground">
          <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold leading-tight">AI-ассистент</p>
            <p className="text-xs text-primary-foreground/80">Подбор мастера по задаче</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            onClick={reset}
            title="Начать заново"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            onClick={() => onOpenChange(false)}
            title="Закрыть"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="scroll-area-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} onPickMaster={onPickMaster} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Подбираю мастера…</span>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Попробуйте:</p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-xs transition hover:border-primary/40 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Опишите задачу…"
              disabled={loading}
              maxLength={1000}
              className="h-10"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-10 w-10 shrink-0 bg-gradient-to-br from-primary to-amber-500 text-primary-foreground"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onPickMaster,
}: {
  message: Message;
  onPickMaster: (id: string, job?: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-secondary text-muted-foreground'
            : 'bg-gradient-to-br from-primary to-amber-500 text-primary-foreground'
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div className={cn('max-w-[85%] space-y-3', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-secondary text-secondary-foreground'
          )}
        >
          {message.content}
        </div>

        {message.followupQuestion && (
          <p className="px-1 text-xs italic text-muted-foreground">💡 {message.followupQuestion}</p>
        )}

        {message.recommendations && message.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-medium text-muted-foreground">
              {message.recommendations.length === 1 ? 'Рекомендую:' : `Топ-${message.recommendations.length}:`}
            </p>
            {message.recommendations.map((rec) => (
              <RecCard key={rec.master.id} rec={rec} onPick={onPickMaster} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecCard({ rec, onPick }: { rec: AiRecommendation; onPick: (id: string, job?: string) => void }) {
  const m = rec.master;
  const initials = m.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 ring-1 ring-border">
          <AvatarImage src={m.avatar} alt={m.name} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{m.name}</p>
            {m.verified && <Badge variant="secondary" className="h-4 px-1 text-[10px]">✓</Badge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {m.profession} · {m.categoryName}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={m.rating} size={12} count={m.reviewsCount} />
          </div>
        </div>
      </div>
      <p className="mt-2 rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Почему:</span> {rec.reason}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          от {m.priceFrom.toLocaleString('ru-RU')} ₽
        </span>
        <Button
          size="sm"
          className="h-7 bg-gradient-to-br from-primary to-amber-500 px-2.5 text-xs text-primary-foreground"
          onClick={() => onPick(m.id, m.profession)}
        >
          Открыть профиль
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function cryptoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
