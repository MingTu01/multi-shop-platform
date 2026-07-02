// 内存 Mock 仓储实现，供测试使用
import type { UserInfo, UserPushSettings, NotifyType } from '@msp/shared';
import type { UserRepo, PushSettingsRepo, NotifyRepo, NotifyInsertInput } from '../src/repos/interfaces.js';

export type MockNotifyRecord = NotifyInsertInput;

export class MockUserRepo implements UserRepo {
  public users: UserInfo[] = [];

  constructor(users: UserInfo[] = []) {
    this.users = users;
  }

  async findById(id: number): Promise<UserInfo | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByStoreAndRole(storeId: string, role: string): Promise<UserInfo[]> {
    return this.users.filter((u) => String(u.store_id) === String(storeId) && u.role === role);
  }

  async findByStore(storeId: string): Promise<UserInfo[]> {
    return this.users.filter((u) => String(u.store_id) === String(storeId));
  }
}

export class MockSettingsRepo implements PushSettingsRepo {
  public settings: Map<number, UserPushSettings> = new Map();

  constructor(map: Record<number, UserPushSettings> = {}) {
    for (const [k, v] of Object.entries(map)) {
      this.settings.set(Number(k), v);
    }
  }

  async getByUser(userId: number): Promise<UserPushSettings> {
    return this.settings.get(userId) || { user_id: userId };
  }
}

export class MockNotifyRepo implements NotifyRepo {
  public records: MockNotifyRecord[] = [];

  async insert(n: NotifyInsertInput): Promise<void> {
    this.records.push({ ...n });
  }
}

export function makeUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    id: 1,
    username: 'u1',
    name: '测试用户',
    role: 'ADMIN',
    store_id: 1,
    ...overrides,
  };
}

export type { NotifyType };
