import type { Role } from '../types/notify.js';

// 角色常量
export const ROLES = {
  ADMIN: 'ADMIN',
  STORE_ADMIN: 'STORE_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  SHAREHOLDER: 'SHAREHOLDER',
} as const;

// 角色判断函数
export function isAdmin(role: string): boolean {
  return role?.toUpperCase() === 'ADMIN';
}

export function isStoreAdmin(role: string): boolean {
  return ['ADMIN', 'STORE_ADMIN'].includes(role?.toUpperCase());
}

export function isManagerOrAbove(role: string): boolean {
  return ['ADMIN', 'STORE_ADMIN', 'MANAGER'].includes(role?.toUpperCase());
}

export function isReadonly(role: string): boolean {
  return ['SHAREHOLDER'].includes(role?.toUpperCase());
}

/**
 * 返回基于角色的记账条目过滤 SQL 子句
 * 当前所有角色均可查看所有条目，返回空字符串
 */
export function entryFilterClause(_role: string): string {
  return '';
}
