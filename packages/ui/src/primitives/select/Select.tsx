import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  /** 自定义渲染当前值（例如带状态点）。返回字符串或节点，节点会作为 select 不可见 overlay */
  renderValue?: (option: SelectOption | undefined) => ReactNode;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  searchable = false,
  disabled,
  className,
  renderValue,
}: SelectProps) {
  const [filter, setFilter] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchable || !filter) return options;
    const kw = filter.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(kw) || o.value.toLowerCase().includes(kw));
  }, [options, searchable, filter]);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {searchable ? (
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索..."
          className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label="搜索选项"
        />
      ) : null}
      <div
        className={cn(
          'relative flex h-9 items-center rounded-md border bg-white px-3 transition-colors',
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200',
          disabled ? 'cursor-not-allowed opacity-60' : '',
          'border-slate-300',
        )}
      >
        {renderValue && selectedOption ? (
          <span className="pointer-events-none flex-1 truncate text-sm text-slate-900">
            {renderValue(selectedOption)}
          </span>
        ) : null}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={placeholder}
          className={cn(
            'h-full w-full cursor-pointer bg-transparent text-sm focus:outline-none',
            renderValue && selectedOption ? 'absolute inset-0 opacity-0' : 'text-slate-900',
          )}
        >
          {placeholder !== undefined && !value ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {filteredOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
