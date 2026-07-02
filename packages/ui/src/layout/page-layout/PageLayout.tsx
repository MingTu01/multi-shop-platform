import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface PageLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children?: ReactNode;
  className?: string;
  sidebarClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * 页面布局 - 左侧边栏 + 顶部 header + 主内容
 * 不传 sidebar 时为单列布局
 */
export function PageLayout({
  sidebar,
  header,
  children,
  className,
  sidebarClassName,
  headerClassName,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full bg-slate-50 text-slate-900',
        sidebar ? 'flex-row' : 'flex-col',
        className,
      )}
    >
      {sidebar ? (
        <aside className={cn('w-60 shrink-0 border-r border-slate-200 bg-white', sidebarClassName)}>
          {sidebar}
        </aside>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {header ? (
          <header
            className={cn(
              'flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-4',
              headerClassName,
            )}
          >
            {header}
          </header>
        ) : null}
        <main className={cn('flex-1 overflow-auto p-4', contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
