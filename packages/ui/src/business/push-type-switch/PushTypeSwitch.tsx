import { useMemo, type ReactNode } from 'react';
import { CATEGORY_COLORS, PUSH_TYPE_CONFIGS, type PushCategory, type PushTypeConfig } from '@msp/shared';
import { cn } from '../../_internal/cn';

export interface PushTypeSwitchProps {
  /** 当前各 push 字段开关状态，key 为 PUSH_TYPE_CONFIGS[].key */
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  /** 仅展示指定分类，未指定则展示全部 */
  category?: PushCategory;
  disabled?: boolean;
  className?: string;
}

interface Group {
  category: PushCategory;
  items: PushTypeConfig[];
}

/**
 * 推送类型开关 - 复用 @msp/shared PUSH_TYPE_CONFIGS / CATEGORY_COLORS
 * 按分类分组渲染，每项为一行 label + toggle switch
 */
export function PushTypeSwitch({
  value,
  onChange,
  category,
  disabled,
  className,
}: PushTypeSwitchProps) {
  const groups = useMemo<Group[]>(() => {
    const filtered = category ? PUSH_TYPE_CONFIGS.filter((c) => c.category === category) : PUSH_TYPE_CONFIGS;
    const map = new Map<PushCategory, PushTypeConfig[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return Array.from(map, ([cat, items]) => ({ category: cat, items }));
  }, [category]);

  const toggle = (key: string) => {
    if (disabled) return;
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {groups.map((group) => {
        const color = CATEGORY_COLORS[group.category];
        return (
          <section key={group.category} className="flex flex-col gap-2">
            <header
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
                color.bg,
              )}
            >
              <span className={cn('inline-block h-2 w-2 rounded-full', color.dot)} aria-hidden="true" />
              <span className={color.text}>{group.category}</span>
            </header>
            <div className="flex flex-col">
              {group.items.map((item) => (
                <SwitchRow
                  key={item.key}
                  label={item.label}
                  description={item.title}
                  checked={!!value[item.key]}
                  disabled={disabled}
                  onChange={() => toggle(item.key)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function SwitchRow({ label, description, checked, disabled, onChange }: SwitchRowProps): ReactNode {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-0',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50',
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm text-slate-800">{label}</span>
        {description && description !== label ? (
          <span className="text-xs text-slate-400">{description}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-300',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
