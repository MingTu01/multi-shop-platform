import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface CardProps {
  title?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * 卡片容器 - 白底圆角阴影，可选标题与右侧操作区
 */
export function Card({ title, extra, children, className, bodyClassName }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)}>
      {title || extra ? (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {extra ? <div className="text-sm">{extra}</div> : null}
        </div>
      ) : null}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </div>
  );
}
