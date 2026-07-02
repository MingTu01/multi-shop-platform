import { type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

const ALIGN_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  empty,
  onRowClick,
  className,
}: TableProps<T>) {
  const colCount = columns.length;
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-3 py-2 font-medium text-slate-600',
                  ALIGN_CLASSES[col.align || 'left'],
                  col.className,
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colCount} className="px-3 py-8 text-center text-slate-400">
                加载中...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-3 py-8 text-center text-slate-400">
                {empty ?? '暂无数据'}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                className={cn(
                  'border-b border-slate-100 last:border-0',
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : '',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-2 text-slate-700',
                      ALIGN_CLASSES[col.align || 'left'],
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row, index)
                      : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
