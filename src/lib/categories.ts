import {
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  Armchair,
  PaintRoller,
  Plug,
  Trees,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_COLORS = [
  'emerald', 'amber', 'rose', 'sky', 'orange', 'violet', 'cyan', 'green',
] as const;
export type CatColor = (typeof CATEGORY_COLORS)[number];

export const ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  Armchair,
  PaintRoller,
  Plug,
  Trees,
};

export function categoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] || HelpCircle;
}

// Tailwind class map for soft category badges
export const CAT_TONE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-500/30', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-200 dark:ring-amber-500/30', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-200 dark:ring-rose-500/30', dot: 'bg-rose-500' },
  sky: { bg: 'bg-sky-100 dark:bg-sky-500/15', text: 'text-sky-700 dark:text-sky-300', ring: 'ring-sky-200 dark:ring-sky-500/30', dot: 'bg-sky-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-200 dark:ring-orange-500/30', dot: 'bg-orange-500' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-500/15', text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-200 dark:ring-violet-500/30', dot: 'bg-violet-500' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/15', text: 'text-cyan-700 dark:text-cyan-300', ring: 'ring-cyan-200 dark:ring-cyan-500/30', dot: 'bg-cyan-500' },
  green: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-300', ring: 'ring-green-200 dark:ring-green-500/30', dot: 'bg-green-600' },
};

export function catTone(color: string) {
  return CAT_TONE[color] || CAT_TONE.emerald;
}

export function formatPrice(from: number, to: number, currency = '₽') {
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  if (to >= 100000) return `от ${fmt(from)} ${currency}`;
  return `${fmt(from)}–${fmt(to)} ${currency}`;
}
