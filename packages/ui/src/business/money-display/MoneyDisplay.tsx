import { formatMoney } from '@msp/shared';
import { cn } from '../../_internal/cn';

export interface MoneyDisplayProps {
  value: number;
  /** 是否根据正负着色（负红正绿） */
  colored?: boolean;
  /** 货币符号，默认 ¥ */
  currency?: string;
  className?: string;
}

/**
 * 金额展示 - 复用 @msp/shared formatMoney
 */
export function MoneyDisplay({ value, colored = false, currency = '¥', className }: MoneyDisplayProps) {
  const isNegative = value < 0;
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        colored && isNegative && 'text-rose-600',
        colored && isPositive && 'text-emerald-600',
        className,
      )}
    >
      {currency}
      {formatMoney(value)}
    </span>
  );
}
