import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  /** 渲染内容区，默认取 items 中匹配项的 children */
  renderContent?: boolean;
}

/**
 * 下划线风格 Tabs
 */
export function Tabs({ items, activeKey, onChange, className, renderContent = true }: TabsProps) {
  const active = items.find((i) => i.key === activeKey);
  return (
    <div className={cn('flex w-full flex-col', className)}>
      <div className="flex items-center gap-1 border-b border-slate-200">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              onClick={() => !item.disabled && onChange(item.key)}
              className={cn(
                'relative -mb-px inline-flex items-center gap-1 border-b-2 px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-blue-600 font-medium text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900',
                item.disabled && 'cursor-not-allowed opacity-50 hover:text-slate-600',
              )}
              aria-selected={isActive}
              role="tab"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {renderContent && active?.children !== undefined ? (
        <div className="flex-1 pt-3">{active.children}</div>
      ) : null}
    </div>
  );
}
