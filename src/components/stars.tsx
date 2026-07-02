import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}

export function Stars({ rating, size = 16, className, showValue, count }: StarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const rounded = rating - full >= 0.75 ? full + 1 : full;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < rounded;
          const half = !filled && i === full && hasHalf;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute inset-0 text-amber-400/30"
                strokeWidth={1.5}
              />
              {(filled || half) && (
                <Star
                  size={size}
                  className="absolute inset-0 text-amber-400 fill-amber-400"
                  strokeWidth={1.5}
                  style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground tabular-nums">{rating.toFixed(1)}</span>
      )}
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
