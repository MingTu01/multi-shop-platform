import type { StoreInfo } from '@msp/shared';
import { cn } from '../../_internal/cn';
import { Select } from '../../primitives/select';

export interface StoreSelectorProps {
  stores: StoreInfo[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 门店选择器 - 基于 Select，展示门店名称 + 营业状态点
 */
export function StoreSelector({
  stores,
  value,
  onChange,
  placeholder = '请选择门店',
  searchable = true,
  disabled,
  className,
}: StoreSelectorProps) {
  const options = stores.map((s) => ({ label: s.name, value: s.id }));
  return (
    <Select
      options={options}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      searchable={searchable}
      disabled={disabled}
      className={cn('min-w-[200px]', className)}
      renderValue={(opt) => {
        const store = stores.find((s) => s.id === opt?.value);
        if (!store) return opt?.label;
        return (
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn('inline-block h-2 w-2 rounded-full', store.is_open ? 'bg-emerald-500' : 'bg-slate-300')}
              aria-hidden="true"
            />
            <span>{store.name}</span>
          </span>
        );
      }}
    />
  );
}
