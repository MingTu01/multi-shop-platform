import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../_internal/cn';
import { THEME_TOKENS, type ThemeMode } from './tokens';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** 初始主题，默认 'light' */
  theme?: ThemeMode;
  /** 注入到包裹 div 上的 className */
  className?: string;
  children: ReactNode;
}

/**
 * 主题 Provider - 在包裹的 div 上设置 dark 类与 CSS 变量
 * 组件本身不强制依赖 Tailwind dark mode 配置，仅切换类名 + 注入 CSS 变量
 */
export function ThemeProvider({ theme: initial = 'light', className, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(initial);

  useEffect(() => {
    setTheme(initial);
  }, [initial]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  const style = useMemo<CSSProperties>(() => ({ ...(THEME_TOKENS[theme] as CSSProperties) }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={cn(theme === 'dark' ? 'dark' : '', className)} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // 提供降级默认值，便于在无 Provider 时单独使用组件
    return {
      theme: 'light',
      setTheme: () => undefined,
      toggleTheme: () => undefined,
    };
  }
  return ctx;
}
