import { formatDate, formatTime } from '@msp/shared';
import { cn } from '../../_internal/cn';

export type DateDisplayFormat = 'date' | 'time' | 'datetime';

export interface DateDisplayProps {
  value: string | Date;
  format?: DateDisplayFormat;
  className?: string;
}

/**
 * 日期展示 - 复用 @msp/shared formatDate / formatTime
 */
export function DateDisplay({ value, format = 'date', className }: DateDisplayProps) {
  let text: string;
  if (format === 'time') {
    text = formatTime(value);
  } else if (format === 'datetime') {
    text = `${formatDate(value)} ${formatTime(value)}`;
  } else {
    text = formatDate(value);
  }
  return <span className={cn('tabular-nums text-slate-700', className)}>{text}</span>;
}
