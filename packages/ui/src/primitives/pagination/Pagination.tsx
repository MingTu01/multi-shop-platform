import { cn } from '../../_internal/cn';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  /** 显示页码按钮数量（含首末当前页），默认 5 */
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safeCurrent = Math.min(Math.max(current, 1), totalPages);

  const pages = computePages(safeCurrent, totalPages, siblingCount);

  const btnBase =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors';

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="分页">
      <button
        type="button"
        className={cn(
          btnBase,
          safeCurrent === 1
            ? 'cursor-not-allowed text-slate-300'
            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        )}
        disabled={safeCurrent === 1}
        onClick={() => onChange(safeCurrent - 1)}
        aria-label="上一页"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="inline-flex h-8 min-w-8 items-center justify-center text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn(
              btnBase,
              p === safeCurrent
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
            )}
            onClick={() => onChange(p)}
            aria-current={p === safeCurrent ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(
          btnBase,
          safeCurrent === totalPages
            ? 'cursor-not-allowed text-slate-300'
            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        )}
        disabled={safeCurrent === totalPages}
        onClick={() => onChange(safeCurrent + 1)}
        aria-label="下一页"
      >
        ›
      </button>
    </nav>
  );
}

function computePages(
  current: number,
  totalPages: number,
  siblingCount: number,
): Array<number | '...'> {
  const totalNumbers = siblingCount * 2 + 5; // first + last + current + 2 dots
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblingCount;
    return [...range(1, leftCount), '...', totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblingCount;
    return [1, '...', ...range(totalPages - rightCount + 1, totalPages)];
  }

  return [1, '...', ...range(leftSibling, rightSibling), '...', totalPages];
}
