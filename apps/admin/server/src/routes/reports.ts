// 报表统计路由
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import type { Database as DB } from 'better-sqlite3';

export function createReportsRouter(db: DB): Router {
  const router = Router();

  // 仪表盘
  router.get('/dashboard', requireAuth, (req, res, next) => {
    try {
      const storeId = req.query.storeId as string;
      const scope = storeId ? 'WHERE store_id = ?' : '';
      const params = storeId ? [storeId] : [];

      const entryRow = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM entries ${scope}`).get(...params) as any;
      const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get() as { count: number };
      const staffCount = storeId
        ? (db.prepare('SELECT COUNT(*) as count FROM users WHERE store_id = ?').get(Number(storeId)) as { count: number })
        : (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number });

      res.json({
        entry_count: entryRow.count,
        entry_total: entryRow.total,
        store_count: storeCount.count,
        staff_count: staffCount.count,
      });
    } catch (e) {
      next(e);
    }
  });

  // 每日汇总
  router.get('/daily', requireAuth, (req, res, next) => {
    try {
      const storeId = req.query.storeId as string;
      const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      if (!storeId) throw new ApiError(400, 'storeId 必填');
      const rows = db
        .prepare("SELECT type, COUNT(*) as count, SUM(amount) as total FROM entries WHERE store_id = ? AND date = ? GROUP BY type")
        .all(storeId, date) as any[];
      res.json({ date, store_id: storeId, breakdown: rows });
    } catch (e) {
      next(e);
    }
  });

  // 月度汇总
  router.get('/monthly', requireAuth, (req, res, next) => {
    try {
      const storeId = req.query.storeId as string;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
      if (!storeId) throw new ApiError(400, 'storeId 必填');
      const rows = db
        .prepare("SELECT date, type, COUNT(*) as count, SUM(amount) as total FROM entries WHERE store_id = ? AND date LIKE ? GROUP BY date, type ORDER BY date")
        .all(storeId, month + '%') as any[];
      res.json({ month, store_id: storeId, breakdown: rows });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
