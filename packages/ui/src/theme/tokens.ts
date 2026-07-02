// 设计 token - 翡翠绿专业主题（现代金融管理风格）
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

// 翡翠绿专业主题 - 适合金融/管理类应用
export const THEME_TOKENS: Record<ThemeMode, Record<string, string>> = {
  light: {
    // 背景
    '--msp-bg': '#f0fdf4',           // 淡翡翠绿背景
    '--msp-surface': '#ffffff',       // 主表面白色
    '--msp-surface-alt': '#f7fee7',   // 次表面淡绿
    
    // 边框
    '--msp-border': '#d1d5db',        // 中性灰边框
    '--msp-border-strong': '#bbf7d0', // 翡翠绿边框
    
    // 文字
    '--msp-text': '#0f172a',          // 深色主文字
    '--msp-text-muted': '#475569',    // 次级文字
    '--msp-text-weak': '#94a3b8',     // 弱文字
    
    // 主色 - 翡翠绿
    '--msp-primary': '#10b981',       // 翡翠绿 500
    '--msp-primary-hover': '#059669', // 翡翠绿 600
    '--msp-primary-active': '#047857',// 翡翠绿 700
    '--msp-primary-light': '#d1fae5', // 翡翠绿 100
    
    // 强调色 - 薄荷绿
    '--msp-accent': '#34d399',        // 翡翠绿 400
    
    // 功能色
    '--msp-danger': '#ef4444',        // 红 500
    '--msp-danger-light': '#fee2e2',  // 红 100
    '--msp-success': '#22c55e',       // 绿 500
    '--msp-success-light': '#bbf7d0', // 绿 100
    '--msp-warning': '#f59e0b',       // 橙 500
    '--msp-warning-light': '#fef3c7', // 橙 100
    '--msp-info': '#3b82f6',          // 蓝 500
    '--msp-info-light': '#dbeafe',    // 蓝 100
    
    // 圆角
    '--msp-radius-xs': '2px',
    '--msp-radius-sm': '4px',
    '--msp-radius-md': '8px',
    '--msp-radius-lg': '12px',
    '--msp-radius-xl': '16px',
    
    // 阴影
    '--msp-shadow-xs': '0 1px 2px 0 rgb(16 185 129 / 0.05)',
    '--msp-shadow-sm': '0 1px 3px 0 rgb(16 185 129 / 0.1), 0 1px 2px -1px rgb(16 185 129 / 0.1)',
    '--msp-shadow-md': '0 4px 6px -1px rgb(16 185 129 / 0.1), 0 2px 4px -2px rgb(16 185 129 / 0.1)',
    '--msp-shadow-lg': '0 10px 15px -3px rgb(16 185 129 / 0.1), 0 4px 6px -4px rgb(16 185 129 / 0.1)',
    '--msp-shadow-card': '0 2px 8px -2px rgb(16 185 129 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.05)',
    
    // 布局
    '--msp-sidebar-width': '240px',
    '--msp-header-height': '64px',
  },
  dark: {
    // 背景
    '--msp-bg': '#022c22',            // 深翡翠绿背景
    '--msp-surface': '#064e3b',       // 主表面深绿
    '--msp-surface-alt': '#0f766e',   // 次表面
    
    // 边框
    '--msp-border': '#134e4a',        // 深绿边框
    '--msp-border-strong': '#059669', // 翡翠绿边框
    
    // 文字
    '--msp-text': '#ecfdf5',          // 浅绿白文字
    '--msp-text-muted': '#a7f3d0',    // 次级文字
    '--msp-text-weak': '#6ee7b7',     // 弱文字
    
    // 主色 - 翡翠绿
    '--msp-primary': '#10b981',
    '--msp-primary-hover': '#34d399',
    '--msp-primary-active': '#6ee7b7',
    '--msp-primary-light': '#064e3b',
    
    // 强调色
    '--msp-accent': '#34d399',
    
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
    '--msp-shadow-xs': '0 1px 2px 0 rgb(16 185 129 / 0.2)',
    '--msp-shadow-sm': '0 1px 3px 0 rgb(16 185 129 / 0.3)',
    '--msp-shadow-md': '0 4px 6px -1px rgb(16 185 129 / 0.3)',
    '--msp-shadow-lg': '0 10px 15px -3px rgb(16 185 129 / 0.3)',
    '--msp-shadow-card': '0 4px 12px -2px rgb(0 0 0 / 0.5)',
    
    // 布局
    '--msp-sidebar-width': '240px',
    '--msp-header-height': '64px',
  },
};