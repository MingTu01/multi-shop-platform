// 角色类型 - 全局唯一来源
export type Role = 'ADMIN' | 'STORE_ADMIN' | 'MANAGER' | 'STAFF' | 'SHAREHOLDER';

// 通知类型
export type NotifyType =
  | 'entry'
  | 'payroll'
  | 'dividend'
  | 'inventory'
  | 'shift'
  | 'health_cert'
  | 'staff'
  | 'store'
  | 'purchase'
  | 'salary_confirm'
  | 'inventory_alert'
  | 'store_alert'
  | 'daily_report'
  | 'weekly_report'
  | 'monthly_report'
  | 'review_reminder'
  | 'alert';

// 通知触发参数
export interface NotifyParams {
  type: NotifyType;
  action: string;
  storeId?: string;
  detail?: string;
  targetUserId?: number;
  operatorName?: string;
}
