// 分红路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { sseManager } from '../services/sse-manager.js';
import type { PushService } from '@msp/push-core';

export function createDividendsRouter(db: DB, pushService?: PushService): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const storeId = req.query.storeId as string;
    if (!storeId) return res.json([]);
    const rows = db
      .prepare('SELECT * FROM dividends WHERE store_id = ? ORDER BY id DESC')
      .all(storeId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        store_id: r.store_id,
        shareholder_id: r.shareholder_id,
        shareholder_name: r.shareholder_name,
        amount: r.amount,
        period: r.period,
        created_at: r.created_at,
      })),
    );
  });

  router.post('/', requireAuth, requireRole('ADMIN', 'STORE_ADMIN'), (req, res, next) => {
    try {
      const { store_id, shareholder_id, shareholder_name, amount, period } = req.body as any;
      if (!store_id || !shareholder_id || amount === undefined) throw new ApiError(400, 'store_id/shareholder_id/amount 必填');
      const info = db
        .prepare('INSERT INTO dividends (store_id, shareholder_id, shareholder_name, amount, period) VALUES (?, ?, ?, ?, ?)')
        .run(store_id, shareholder_id, shareholder_name || null, amount, period || null);
      sseManager.broadcastDataChange({ type: 'dividend', storeId: store_id });
      void pushService
        ?.trigger({
          type: 'dividend',
          action: 'grant',
          storeId: String(store_id),
          detail: `分红 ${amount}`,
        })
        .catch(() => {});
      res.json({ id: info.lastInsertRowid, ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
