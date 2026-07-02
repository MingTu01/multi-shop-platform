// push-core 仓储接口的 SQLite 实现
import type { Database as DB } from 'better-sqlite3';
import type { UserInfo, UserPushSettings, NotifyType } from '@msp/shared';
import type { UserRepo, PushSettingsRepo, NotifyRepo, NotifyInsertInput, StoresRepo } from '@msp/push-core';

function rowToUser(row: any): UserInfo {
  if (!row) return null as any;
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    store_id: row.store_id ?? null,
    store_name: row.store_name ?? undefined,
    phone: row.phone ?? undefined,
    avatar: row.avatar ?? undefined,
    address: row.address ?? undefined,
    salary: row.salary ?? undefined,
    status: row.status ?? undefined,
    job_title: row.job_title ?? undefined,
  };
}

export class SqliteUserRepo implements UserRepo {
  constructor(private db: DB) {}

  async findById(id: number): Promise<UserInfo | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    return row ? rowToUser(row) : null;
  }

  async findByStoreAndRole(storeId: string, role: string): Promise<UserInfo[]> {
    const rows = this.db
      .prepare('SELECT * FROM users WHERE store_id = ? AND role = ? AND status = ?')
      .all(Number(storeId), role, 'active') as any[];
    return rows.map(rowToUser);
  }

  async findByStore(storeId: string): Promise<UserInfo[]> {
    const rows = this.db
      .prepare('SELECT * FROM users WHERE store_id = ? AND status = ?')
      .all(Number(storeId), 'active') as any[];
    return rows.map(rowToUser);
  }
}

export class SqliteSettingsRepo implements PushSettingsRepo {
  constructor(private db: DB) {}

  async getByUser(userId: number): Promise<UserPushSettings> {
    const row = this.db.prepare('SELECT * FROM push_settings WHERE user_id = ?').get(userId) as any;
    if (!row) return { user_id: userId };
    const result: UserPushSettings = { user_id: userId };
    for (const key of Object.keys(row)) {
      if (key === 'user_id') continue;
      const val = row[key];
      if (typeof val === 'number') {
        // 0/1 → boolean
        result[key] = val === 1;
      } else {
        result[key] = val;
      }
    }
    return result;
  }
}

export class SqliteNotifyRepo implements NotifyRepo {
  constructor(private db: DB) {}

  async insert(n: NotifyInsertInput): Promise<void> {
    this.db
      .prepare('INSERT INTO notifications (user_id, title, link, type, detail, read) VALUES (?, ?, ?, ?, ?, 0)')
      .run(n.user_id, n.title, n.link || null, n.type, n.detail || null);
  }
}

export class SqliteStoresRepo implements StoresRepo {
  constructor(private db: DB) {}

  async listStoreIds(): Promise<string[]> {
    const rows = this.db.prepare('SELECT id FROM stores WHERE status = ?').all('active') as { id: string }[];
    return rows.map((r) => r.id);
  }
}

export type { NotifyType };
