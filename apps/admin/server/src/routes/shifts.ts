// 排班/开闭店路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { sseManager } from '../services/sse-manager.js';
import type { PushService } from '@msp/push-core';

export function createShiftsRouter(db: DB, pushService?: PushService): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const storeId = req.query.storeId as string;
    if (!storeId) return res.json([]);
    const rows = db
      .prepare('SELECT * FROM shifts WHERE store_id = ? ORDER BY time DESC, id DESC')
      .all(storeId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        store_id: r.store_id,
        type: r.type,
        operator_id: r.operator_id,
        operator_name: r.operator_name,
        time: r.time,
        note: r.note,
      })),
    );
  });

  router.post('/', requireAuth, (req, res, next) => {
    try {
      const { store_id, type, time, note } = req.body as any;
      if (!store_id || !type || !time) throw new ApiError(400, 'store_id/type/time 必填');
      const user = req.user!;
      const info = db
        .prepare('INSERT INTO shifts (store_id, type, operator_id, operator_name, time, note) VALUES (?, ?, ?, ?, ?, ?)')
        .run(store_id, type, user.userId, user.username, time, note || null);
      // 更新店铺开闭状态
      if (type === 'open' || type === 'close') {
        db.prepare('UPDATE stores SET is_open = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
          type === 'open' ? 1 : 0,
          store_id,
        );
      }
      sseManager.broadcastDataChange({ type: 'shift', storeId: store_id });
      void pushService
        ?.trigger({
          type: 'shift',
          action: type,
          storeId: String(store_id),
          detail: type === 'open' ? '开店' : '闭店',
          operatorName: user.username,
        })
        .catch(() => {});
      res.json({ id: info.lastInsertRowid, ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
