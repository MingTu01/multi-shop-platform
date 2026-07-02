// 设计 token - CSS 变量名（保持与 Tailwind v4 友好）
// 组件直接使用 Tailwind utility class，此处仅提供主题相关 CSS 变量名供 ThemeProvider 注入
export const tokens = {
  color: {
    bg: '--msp-color-bg',
    surface: '--msp-color-surface',
    border: '--msp-color-border',
    text: '--msp-color-text',
    textMuted: '--msp-color-text-muted',
    primary: '--msp-color-primary',
    danger: '--msp-color-danger',
    success: '--msp-color-success',
    warning: '--msp-color-warning',
  },
  radius: {
    sm: '--msp-radius-sm',
    md: '--msp-radius-md',
    lg: '--msp-radius-lg',
  },
  shadow: {
    card: '--msp-shadow-card',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export const THEME_TOKENS: Record<ThemeMode, Record<string, string>> = {
  light: {
    '--msp-color-bg': '#f8fafc',
    '--msp-color-surface': '#ffffff',
    '--msp-color-border': '#e2e8f0',
    '--msp-color-text': '#0f172a',
    '--msp-color-text-muted': '#64748b',
    '--msp-color-primary': '#2563eb',
    '--msp-color-danger': '#dc2626',
    '--msp-color-success': '#16a34a',
    '--msp-color-warning': '#d97706',
    '--msp-radius-sm': '4px',
    '--msp-radius-md': '8px',
    '--msp-radius-lg': '12px',
    '--msp-shadow-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  dark: {
    '--msp-color-bg': '#0f172a',
    '--msp-color-surface': '#1e293b',
    '--msp-color-border': '#334155',
    '--msp-color-text': '#f1f5f9',
    '--msp-color-text-muted': '#94a3b8',
    '--msp-color-primary': '#3b82f6',
    '--msp-color-danger': '#ef4444',
    '--msp-color-success': '#22c55e',
    '--msp-color-warning': '#f59e0b',
    '--msp-radius-sm': '4px',
    '--msp-radius-md': '8px',
    '--msp-radius-lg': '12px',
    '--msp-shadow-card': '0 1px 3px 0 rgb(0 0 0 / 0.4)',
  },
};
