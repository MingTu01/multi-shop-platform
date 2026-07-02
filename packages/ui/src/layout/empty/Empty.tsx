import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface EmptyProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const DefaultIcon = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <rect x="8" y="12" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M16 24h24M16 32h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 空状态 - 居中展示标题、描述与可选操作
 */
export function Empty({
  title = '暂无数据',
  description,
  action,
  icon,
  className,
}: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-10 text-slate-400', className)}>
      <div className="text-slate-300">{icon ?? DefaultIcon}</div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      {description ? <div className="max-w-sm text-center text-xs text-slate-400">{description}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
