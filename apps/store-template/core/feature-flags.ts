// 特性开关解析

export interface FeatureFlags {
  inventory: boolean;
  shifts: boolean;
  payroll: boolean;
  dividends: boolean;
  reports: boolean;
  notifications: boolean;
  pushSettings: boolean;
}

// 判断某个特性是否启用
export function isFeatureEnabled(flags: FeatureFlags, key: keyof FeatureFlags): boolean {
  return flags[key] === true;
}

// 路由 path -> 特性 key 映射（用于按特性开关过滤侧边栏）
// 未在映射中的路由（如本店信息、记账）始终显示
export const ROUTE_FEATURE_MAP: Record<string, keyof FeatureFlags> = {
  '/inventory': 'inventory',
  '/shifts': 'shifts',
  '/payroll': 'payroll',
  '/reports': 'reports',
  '/notifications': 'notifications',
  '/push-settings': 'pushSettings',
};
