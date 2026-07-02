// SQLite 连接单例
import Database from 'better-sqlite3';
import type { Database as DB } from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import type { EnvConfig } from '../config/env.js';

let dbInstance: DB | null = null;

export function getDb(config?: EnvConfig): DB {
  if (dbInstance) return dbInstance;
  const dbPath = config?.dbPath || process.env.DB_PATH || './data/store.db';
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  dbInstance = db;
  return db;
}

// 测试用：传入内存数据库
export function setDbForTest(db: DB): void {
  dbInstance = db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
