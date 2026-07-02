// 仓储接口定义 - 由宿主后端实现并注入到 PushService
import type { UserInfo, UserPushSettings, NotifyType, NotifyParams } from '@msp/shared';
import type { PushChannel } from '../channels/channel.js';

export interface UserRepo {
  findById(id: number): Promise<UserInfo | null>;
  findByStoreAndRole(storeId: string, role: string): Promise<UserInfo[]>;
  findByStore(storeId: string): Promise<UserInfo[]>;
}

export interface PushSettingsRepo {
  getByUser(userId: number): Promise<UserPushSettings>;
}

export interface NotifyInsertInput {
  user_id: number;
  title: string;
  link?: string;
  type: NotifyType;
  detail?: string;
}

export interface NotifyRepo {
  insert(n: NotifyInsertInput): Promise<void>;
}

export interface PushDeps {
  userRepo: UserRepo;
  settingsRepo: PushSettingsRepo;
  notifyRepo: NotifyRepo;
  channels: PushChannel[];
  logger?: { info: (m: string) => void; error: (m: string, e?: unknown) => void };
}

// 调度器需要的店铺仓储接口
export interface StoresRepo {
  listStoreIds(): Promise<string[]>;
}

export type { NotifyParams };
