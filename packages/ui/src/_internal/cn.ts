import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind class - 去重 + 条件拼接
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
