// 装配 PushService + 注入 SQLite repos + 启动调度器
import type { Database as DB } from 'better-sqlite3';
import { PushService, PushPlusChannel, WecomChannel, IyuuChannel, Scheduler, registerReportSchedules } from '@msp/push-core';
import { SqliteUserRepo, SqliteSettingsRepo, SqliteNotifyRepo, SqliteStoresRepo } from '../repos/sqlite-repos.js';
import type { EnvConfig } from '../config/env.js';

export interface PushRuntime {
  pushService: PushService;
  scheduler: Scheduler;
  stop: () => void;
}

export function bootstrapPush(db: DB, _config: EnvConfig): PushRuntime {
  const userRepo = new SqliteUserRepo(db);
  const settingsRepo = new SqliteSettingsRepo(db);
  const notifyRepo = new SqliteNotifyRepo(db);
  const storesRepo = new SqliteStoresRepo(db);

  const pushService = new PushService({
    userRepo,
    settingsRepo,
    notifyRepo,
    channels: [new PushPlusChannel(), new WecomChannel(), new IyuuChannel()],
    logger: {
      info: (m) => console.log('[push]', m),
      error: (m, e) => console.error('[push]', m, e instanceof Error ? e.message : e),
    },
  });

  const scheduler = new Scheduler(pushService, storesRepo, { tickMs: 60_000 });
  registerReportSchedules(scheduler);

  return {
    pushService,
    scheduler,
    stop: () => scheduler.stop(),
  };
}
