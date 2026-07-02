import type { Role } from './notify.js';

// 店铺信息
export interface StoreInfo {
  id: string;
  name: string;
  address?: string;
  initial_capital?: number;
  is_open: number;
  status?: string;
  staff_count?: number;
  shareholders?: Shareholder[];
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

// 股东
export interface Shareholder {
  id: number;
  store_id: string;
  name: string;
  phone?: string;
  ratio: number;
}

// 记账条目
export interface Entry {
  id: number;
  store_id: string;
  type: string;
  category?: string;
  amount: number;
  note?: string;
  date?: string;
  created_by?: number;
  created_at?: string;
  creator_name?: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  name: string;
  role: Role;
  store_id?: number | null;
  store_name?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  salary?: number;
  status?: string;
  job_title?: string;
}

// 库存项
export interface InventoryItem {
  id: number;
  store_id: string;
  name: string;
  quantity: number;
  photo?: string;
  status: string;
  sort_order: number;
}

// 通知
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  link?: string;
  read: number;
  created_at: string;
}

// 用户推送设置
export interface UserPushSettings {
  user_id?: number;
  pushplus_token?: string;
  wecom_secret?: string;
  iyuu_token?: string;
  [key: string]: any;
}

// re-export 角色和通知类型
export * from './notify.js';
