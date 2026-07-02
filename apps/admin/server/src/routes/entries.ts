// 记账路由 - 写操作触发推送 + SSE 广播
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { sseManager } from '../services/sse-manager.js';
import type { PushService } from '@msp/push-core';

export function createEntriesRouter(db: DB, pushService?: PushService): Router {
  const router = Router();

  // 列表
  router.get('/', requireAuth, (req, res) => {
    const storeId = req.query.storeId as string;
    if (!storeId) {
      return res.json([]);
    }
    const rows = db
      .prepare('SELECT * FROM entries WHERE store_id = ? ORDER BY date DESC, id DESC')
      .all(storeId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        store_id: r.store_id,
        type: r.type,
        category: r.category,
        amount: r.amount,
        note: r.note,
        date: r.date,
        created_by: r.created_by,
        created_at: r.created_at,
        creator_name: r.creator_name,
      })),
    );
  });

  // 新增
  router.post('/', requireAuth, (req, res, next) => {
    try {
      const { store_id, type, category, amount, note, date } = req.body as any;
      if (!store_id || !type || amount === undefined || !date) {
        throw new ApiError(400, 'store_id/type/amount/date 必填');
      }
      const user = req.user!;
      const info = db
        .prepare(
          'INSERT INTO entries (store_id, type, category, amount, note, date, created_by, creator_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .run(store_id, type, category || null, amount, note || null, date, user.userId, user.username);
      const entryId = info.lastInsertRowid as number;

      // SSE 广播
      sseManager.broadcastDataChange({ type: 'entry', storeId: store_id });

      // 异步触发推送
      void pushService
        ?.trigger({
          type: 'entry',
          action: 'create',
          storeId: String(store_id),
          detail: `${type} ${amount}`,
          operatorName: user.username,
        })
        .catch(() => {});

      res.json({ id: entryId, ok: true });
    } catch (e) {
      next(e);
    }
  });

  // 删除
  router.delete('/:id', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT store_id FROM entries WHERE id = ?').get(req.params.id) as any;
      db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);
      if (row) {
        sseManager.broadcastDataChange({ type: 'entry', storeId: row.store_id });
      }
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
