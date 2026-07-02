// 系统设置 + 健康检查 + 升级
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { Database as DB } from 'better-sqlite3';

export function createSystemRouter(db: DB): Router {
  const router = Router();

  // 健康检查
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 获取全部系统设置（管理员）
  router.get('/settings', requireAuth, requireRole('ADMIN'), (_req, res) => {
    const rows = db.prepare('SELECT * FROM system_settings').all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) result[r.key] = r.value;
    res.json(result);
  });

  // 更新系统设置
  router.put('/settings', requireAuth, requireRole('ADMIN'), (req, res) => {
    const body = req.body as Record<string, string>;
    const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) stmt.run(k, String(v));
    });
    tx(Object.entries(body));
    res.json({ ok: true });
  });

  // 版本信息
  router.get('/version', (_req, res) => {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'version'").get() as { value: string } | undefined;
    res.json({ version: row?.value || '0.4.0' });
  });

  return router;
}
