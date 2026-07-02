// 设计 token - indigo 主题（匹配原项目 Multi Shop Link）
// 组件直接使用 Tailwind utility class，此处仅提供主题相关 CSS 变量名供 ThemeProvider 注入
export const tokens = {
  color: {
    bg: '--msp-bg',
    surface: '--msp-surface',
    surfaceAlt: '--msp-surface-alt',
    border: '--msp-border',
    borderStrong: '--msp-border-strong',
    text: '--msp-text',
    textMuted: '--msp-text-muted',
    textWeak: '--msp-text-weak',
    primary: '--msp-primary',
    primaryHover: '--msp-primary-hover',
    primaryActive: '--msp-primary-active',
    primaryLight: '--msp-primary-light',
    accent: '--msp-accent',
    danger: '--msp-danger',
    dangerLight: '--msp-danger-light',
    success: '--msp-success',
    successLight: '--msp-success-light',
    warning: '--msp-warning',
    warningLight: '--msp-warning-light',
    info: '--msp-info',
    infoLight: '--msp-info-light',
  },
  radius: {
    xs: '--msp-radius-xs',
    sm: '--msp-radius-sm',
    md: '--msp-radius-md',
    lg: '--msp-radius-lg',
    xl: '--msp-radius-xl',
  },
  shadow: {
    xs: '--msp-shadow-xs',
    sm: '--msp-shadow-sm',
    md: '--msp-shadow-md',
    lg: '--msp-shadow-lg',
    card: '--msp-shadow-card',
  },
  spacing: {
    sidebar: '--msp-sidebar-width',
    header: '--msp-header-height',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

// indigo 主题 - 匹配原项目 Multi Shop Link
export const THEME_TOKENS: Record<ThemeMode, Record<string, string>> = {
  light: {
    // 背景
    '--msp-bg': '#f6f7fb', // 柔和浅灰背景
    '--msp-surface': '#ffffff', // 主表面白色
    '--msp-surface-alt': '#f8fafc', // 次表面

    // 边框
    '--msp-border': '#e2e8f0', // 中性灰边框
    '--msp-border-strong': '#c7d2fe', // indigo 边框

    // 文字
    '--msp-text': '#0f172a', // 深色主文字
    '--msp-text-muted': '#475569', // 次级文字
    '--msp-text-weak': '#94a3b8', // 弱文字

    // 主色 - indigo
    '--msp-primary': '#6366f1', // indigo 500
    '--msp-primary-hover': '#4f46e5', // indigo 600
    '--msp-primary-active': '#4338ca', // indigo 700
    '--msp-primary-light': '#e0e7ff', // indigo 100

    // 强调色 - violet
    '--msp-accent': '#8b5cf6', // violet 500

    // 功能色
    '--msp-danger': '#ef4444', // 红 500
    '--msp-danger-light': '#fee2e2', // 红 100
    '--msp-success': '#22c55e', // 绿 500
    '--msp-success-light': '#dcfce7', // 绿 100
    '--msp-warning': '#f59e0b', // 橙 500
    '--msp-warning-light': '#fef3c7', // 橙 100
    '--msp-info': '#3b82f6', // 蓝 500
    '--msp-info-light': '#dbeafe', // 蓝 100

    // 圆角
    '--msp-radius-xs': '2px',
    '--msp-radius-sm': '4px',
    '--msp-radius-md': '8px',
    '--msp-radius-lg': '12px',
    '--msp-radius-xl': '16px',

    // 阴影
    '--msp-shadow-xs': '0 1px 2px 0 rgb(99 102 241 / 0.05)',
    '--msp-shadow-sm': '0 1px 3px 0 rgb(99 102 241 / 0.1), 0 1px 2px -1px rgb(99 102 241 / 0.1)',
    '--msp-shadow-md': '0 4px 6px -1px rgb(99 102 241 / 0.1), 0 2px 4px -2px rgb(99 102 241 / 0.1)',
    '--msp-shadow-lg': '0 10px 15px -3px rgb(99 102 241 / 0.1), 0 4px 6px -4px rgb(99 102 241 / 0.1)',
    '--msp-shadow-card': '0 2px 8px -2px rgb(99 102 241 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.05)',

    // 布局
    '--msp-sidebar-width': '256px',
    '--msp-header-height': '64px',
  },
  dark: {
    // 背景
    '--msp-bg': '#0f172a', // 深色背景
    '--msp-surface': '#1e293b', // 主表面
    '--msp-surface-alt': '#334155', // 次表面

    // 边框
    '--msp-border': '#334155',
    '--msp-border-strong': '#4f46e5',

    // 文字
    '--msp-text': '#f1f5f9',
    '--msp-text-muted': '#cbd5e1',
    '--msp-text-weak': '#94a3b8',

    // 主色 - indigo
    '--msp-primary': '#6366f1',
    '--msp-primary-hover': '#818cf8',
    '--msp-primary-active': '#a5b4fc',
    '--msp-primary-light': '#312e81',

    // 强调色
    '--msp-accent': '#8b5cf6',

    // 功能色
    '--msp-danger': '#f87171',
    '--msp-danger-light': '#450a0a',
    '--msp-success': '#4ade80',
    '--msp-success-light': '#052e16',
    '--msp-warning': '#fbbf24',
    '--msp-warning-light': '#451a03',
    '--msp-info': '#60a5fa',
    '--msp-info-light': '#1e3a8a',

    // 圆角
    '--msp-radius-xs': '2px',
    '--msp-radius-sm': '4px',
    '--msp-radius-md': '8px',
    '--msp-radius-lg': '12px',
    '--msp-radius-xl': '16px',

    // 阴影
    '--msp-shadow-xs': '0 1px 2px 0 rgb(99 102 241 / 0.2)',
    '--msp-shadow-sm': '0 1px 3px 0 rgb(99 102 241 / 0.3)',
    '--msp-shadow-md': '0 4px 6px -1px rgb(99 102 241 / 0.3)',
    '--msp-shadow-lg': '0 10px 15px -3px rgb(99 102 241 / 0.3)',
    '--msp-shadow-card': '0 4px 12px -2px rgb(0 0 0 / 0.5)',

    // 布局
    '--msp-sidebar-width': '256px',
    '--msp-header-height': '64px',
  },
};
