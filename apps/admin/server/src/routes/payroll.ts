// 工资路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { assertStoreAccess, assertStoreQueryAccess } from '../middleware/store-access.js';
import { sseManager } from '../services/sse-manager.js';
import type { PushService } from '@msp/push-core';

export function createPayrollRouter(db: DB, pushService?: PushService): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const storeId = assertStoreQueryAccess(req);
    if (!storeId) return res.json([]);
    const rows = db
      .prepare(
        `SELECT p.*, u.name as user_name, u.username
         FROM payroll p LEFT JOIN users u ON p.user_id = u.id
         WHERE p.store_id = ? ORDER BY p.id DESC`,
      )
      .all(storeId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        store_id: r.store_id,
        user_id: r.user_id,
        user_name: r.user_name,
        amount: r.amount,
        status: r.status,
        period: r.period,
        confirmed_at: r.confirmed_at,
      })),
    );
  });

  router.post('/', requireAuth, (req, res, next) => {
    try {
      const { store_id, user_id, amount, period } = req.body as any;
      if (!store_id || !user_id || amount === undefined) throw new ApiError(400, 'store_id/user_id/amount 必填');
      assertStoreAccess(req, store_id);
      const info = db
        .prepare('INSERT INTO payroll (store_id, user_id, amount, status, period) VALUES (?, ?, ?, ?, ?)')
        .run(store_id, user_id, amount, 'pending', period || null);
      sseManager.broadcastDataChange({ type: 'payroll', storeId: store_id });
      res.json({ id: info.lastInsertRowid, ok: true });
    } catch (e) {
      next(e);
    }
  });

  // 工资确认（员工本人确认）
  router.put('/:id/confirm', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id) as any;
      if (!row) throw new ApiError(404, '工资记录不存在');
      // 仅本人或管理员可确认
      if (req.user!.role === 'STAFF' && row.user_id !== req.user!.userId) {
        throw new ApiError(403, '只能确认自己的工资');
      }
      db.prepare("UPDATE payroll SET status = 'confirmed', confirmed_at = datetime('now') WHERE id = ?").run(
        req.params.id,
      );
      sseManager.broadcastDataChange({ type: 'payroll', storeId: row.store_id });
      void pushService
        ?.trigger({
          type: 'salary_confirm',
          action: 'confirm',
          storeId: String(row.store_id),
          targetUserId: row.user_id,
          detail: '工资已确认',
        })
        .catch(() => {});
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
