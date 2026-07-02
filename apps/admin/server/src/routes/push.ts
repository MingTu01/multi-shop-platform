// 推送设置路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { PUSH_TYPE_CONFIGS } from '@msp/shared';

export function createPushSettingsRouter(db: DB): Router {
  const router = Router();

  // 获取当前用户推送设置
  router.get('/', requireAuth, (req, res) => {
    let row = db.prepare('SELECT * FROM push_settings WHERE user_id = ?').get(req.user!.userId) as any;
    if (!row) {
      // 首次访问初始化默认设置
      const defaults: Record<string, number> = { user_id: req.user!.userId };
      for (const c of PUSH_TYPE_CONFIGS) {
        defaults[c.key] = c.defaultSelected ? 1 : 0;
      }
      const cols = Object.keys(defaults);
      const placeholders = cols.map(() => '?').join(', ');
      db.prepare(`INSERT INTO push_settings (${cols.join(', ')}) VALUES (${placeholders})`).run(...Object.values(defaults));
      row = db.prepare('SELECT * FROM push_settings WHERE user_id = ?').get(req.user!.userId) as any;
    }
    const result: Record<string, any> = { user_id: row.user_id };
    for (const key of Object.keys(row)) {
      if (key === 'user_id') continue;
      const val = row[key];
      result[key] = typeof val === 'number' ? val === 1 : val;
    }
    res.json(result);
  });

  // 更新推送设置
  router.put('/', requireAuth, (req, res, next) => {
    try {
      const body = req.body as Record<string, any>;
      const allowedKeys = new Set([
        'pushplus_token',
        'wecom_secret',
        'iyuu_token',
        ...PUSH_TYPE_CONFIGS.map((c) => c.key),
      ]);
      // 确保记录存在
      const exists = db.prepare('SELECT 1 FROM push_settings WHERE user_id = ?').get(req.user!.userId);
      if (!exists) {
        db.prepare('INSERT INTO push_settings (user_id) VALUES (?)').run(req.user!.userId);
      }
      const sets: string[] = [];
      const vals: any[] = [];
      for (const [k, v] of Object.entries(body)) {
        if (!allowedKeys.has(k)) continue;
        sets.push(`${k} = ?`);
        if (typeof v === 'boolean') {
          vals.push(v ? 1 : 0);
        } else {
          vals.push(v);
        }
      }
      if (sets.length > 0) {
        vals.push(req.user!.userId);
        db.prepare(`UPDATE push_settings SET ${sets.join(', ')} WHERE user_id = ?`).run(...vals);
      }
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
