import type { IconProps } from './types';

export function IconStore({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3h18v2H3V3z" />
      <path d="M5 5v3a2 2 0 002 2h10a2 2 0 002-2V5" />
      <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9" />
      <path d="M10 14h4" />
    </svg>
  );
}