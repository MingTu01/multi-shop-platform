import type { Role } from '../types/notify.js';

// 权限矩阵：路由/功能 -> 允许的角色
const permissionMatrix: Record<string, Role[]> = {
  // 管理端
  dashboard: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],
  stores: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  notifications: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  upgrade: ['ADMIN'],
  password: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  adminSettings: ['ADMIN'],

  // 店铺端
  storeOverview: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeEntries: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeInventory: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeShifts: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storePayroll: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeDividends: ['ADMIN', 'STORE_ADMIN', 'SHAREHOLDER'],
  storeStaff: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],
  storeReport: ['ADMIN', 'STORE_ADMIN', 'SHAREHOLDER', 'MANAGER'],
  storeLogs: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'SHAREHOLDER'],
  storeAccount: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeSettings: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],
  storeNotifications: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'],
  storeAdmin: ['ADMIN', 'STORE_ADMIN'],
  storeAdminSettings: ['ADMIN', 'STORE_ADMIN'],
  storeNotificationSettings: ['ADMIN', 'STORE_ADMIN'],
  storePurchase: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'SHAREHOLDER'],
};

export type PermissionKey = string;

export function canAccess(key: PermissionKey, role?: Role): boolean {
  if (!role) return false;
  const allowed = permissionMatrix[key];
  if (!allowed) return false;
  return allowed.includes(role);
}

// 推送内容类型权限矩阵（角色 -> 允许接收的通知类型）
export const ROLE_ALLOWED_TYPES: Record<string, string[]> = {
  ADMIN: ['entry', 'payroll', 'dividend', 'inventory', 'shift', 'health_cert', 'staff', 'store', 'purchase', 'salary_confirm', 'inventory_alert', 'store_alert', 'daily_report', 'weekly_report', 'monthly_report', 'review_reminder', 'alert'],
  STORE_ADMIN: ['entry', 'payroll', 'dividend', 'inventory', 'shift', 'health_cert', 'staff', 'store', 'purchase', 'salary_confirm', 'inventory_alert', 'store_alert', 'daily_report', 'weekly_report', 'monthly_report', 'review_reminder'],
  MANAGER: ['entry', 'payroll', 'inventory', 'shift', 'health_cert', 'staff', 'store', 'purchase', 'salary_confirm', 'inventory_alert', 'store_alert', 'daily_report'],
  STAFF: ['payroll', 'salary_confirm', 'health_cert'],
  SHAREHOLDER: ['dividend', 'store', 'store_alert'],
};

export function isContentTypeAllowed(role: string, type: string): boolean {
  const allowed = ROLE_ALLOWED_TYPES[role?.toUpperCase()];
  return allowed ? allowed.includes(type) : false;
}
