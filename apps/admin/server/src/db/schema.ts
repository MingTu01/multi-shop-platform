// 数据库建表 schema
import type { Database as DB } from 'better-sqlite3';
import { hashPassword } from '../utils/password.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  store_id INTEGER,
  store_name TEXT,
  phone TEXT,
  avatar TEXT,
  address TEXT,
  salary REAL,
  status TEXT DEFAULT 'active',
  job_title TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  initial_capital REAL DEFAULT 0,
  is_open INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  staff_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shareholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  ratio REAL NOT NULL,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  note TEXT,
  date TEXT NOT NULL,
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  creator_name TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  photo TEXT,
  status TEXT DEFAULT 'normal',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  type TEXT NOT NULL,
  operator_id INTEGER,
  operator_name TEXT,
  time TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  period TEXT,
  confirmed_at TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS dividends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  shareholder_id INTEGER NOT NULL,
  shareholder_name TEXT,
  amount REAL NOT NULL,
  period TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  link TEXT,
  type TEXT,
  detail TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS push_settings (
  user_id INTEGER PRIMARY KEY,
  pushplus_token TEXT,
  wecom_secret TEXT,
  iyuu_token TEXT,
  push_daily_report INTEGER DEFAULT 1,
  push_weekly_report INTEGER DEFAULT 0,
  push_monthly_report INTEGER DEFAULT 0,
  push_alert INTEGER DEFAULT 1,
  push_review_reminder INTEGER DEFAULT 0,
  push_inventory_alert INTEGER DEFAULT 1,
  push_store_alert INTEGER DEFAULT 1,
  push_openclose_notify INTEGER DEFAULT 1,
  push_bookkeeping_notify INTEGER DEFAULT 0,
  push_inventory_notify INTEGER DEFAULT 0,
  push_purchase_notify INTEGER DEFAULT 0,
  push_staff INTEGER DEFAULT 0,
  push_store INTEGER DEFAULT 0,
  push_salary_confirm INTEGER DEFAULT 1,
  push_dividend_notify INTEGER DEFAULT 1,
  push_health_cert INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS operation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action TEXT NOT NULL,
  target TEXT,
  ip TEXT,
  time TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS store_tokens (
  store_id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  config_json TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_template_assignments (
  store_id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  assigned_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_store ON entries(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory_items(store_id);
CREATE INDEX IF NOT EXISTS idx_shifts_store ON shifts(store_id);
CREATE INDEX IF NOT EXISTS idx_payroll_store ON payroll(store_id);
CREATE INDEX IF NOT EXISTS idx_dividends_store ON dividends(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON operation_logs(user_id);
`;

export function initSchema(db: DB): void {
  db.exec(SCHEMA_SQL);
}

// 初始化默认数据（仅首次）
export function seedDefaultData(db: DB): void {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) return;

  // 默认管理员（密码: admin123）
  const adminHash = hashPassword('admin123');
  db.prepare(
    'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
  ).run('admin', adminHash, '系统管理员', 'ADMIN');

  // 默认店铺
  db.prepare(
    'INSERT INTO stores (id, name, is_open, initial_capital) VALUES (?, ?, ?, ?)',
  ).run('S001', '示例店铺', 1, 100000);

  // 默认系统设置
  db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)').run('version', '0.6.0');
  db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)').run('initialized', '1');

  // 默认模板（通用模板 + 零售示例）
  const defaultConfig = JSON.stringify({
    name: '通用模板',
    version: '0.5.0',
    features: { inventory: true, shifts: true, payroll: true, dividends: true, reports: true, notifications: true, pushSettings: true },
    theme: { primary: '#16a34a' },
    routes: [
      { path: '/', label: '本店信息' },
      { path: '/entries', label: '记账' },
      { path: '/inventory', label: '库存' },
      { path: '/shifts', label: '排班' },
      { path: '/payroll', label: '工资' },
      { path: '/reports', label: '报表' },
      { path: '/notifications', label: '通知' },
      { path: '/push-settings', label: '推送设置' },
    ],
  });
  const retailConfig = JSON.stringify({
    name: '零售示例',
    version: '0.5.0',
    features: { inventory: true, shifts: false, payroll: false, dividends: false, reports: true, notifications: true, pushSettings: false },
    theme: { primary: '#0ea5e9' },
    routes: [
      { path: '/', label: '本店信息' },
      { path: '/entries', label: '记账' },
      { path: '/inventory', label: '库存' },
      { path: '/reports', label: '报表' },
      { path: '/notifications', label: '通知' },
    ],
  });
  db.prepare('INSERT OR IGNORE INTO templates (id, name, version, config_json, description, source) VALUES (?, ?, ?, ?, ?, ?)').run(
    'default', '通用模板', '0.5.0', defaultConfig, '系统内置通用模板', 'builtin',
  );
  db.prepare('INSERT OR IGNORE INTO templates (id, name, version, config_json, description, source) VALUES (?, ?, ?, ?, ?, ?)').run(
    'retail-demo', '零售示例', '0.5.0', retailConfig, '系统内置零售示例模板', 'builtin',
  );
}
