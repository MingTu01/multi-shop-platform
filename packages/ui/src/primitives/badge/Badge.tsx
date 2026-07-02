import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface BadgeProps {
  color?: string;
  dot?: boolean;
  count?: number;
  children?: ReactNode;
  className?: string;
}

export function Badge({ color, dot, count, children, className }: BadgeProps) {
  const showDot = dot && (count === undefined || count === 0);
  const showCount = typeof count === 'number' && count > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        color || 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      {showDot ? (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {showCount ? <span>{count > 99 ? '99+' : count}</span> : null}
      {children}
    </span>
  );
}
