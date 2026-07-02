// 库存路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { sseManager } from '../services/sse-manager.js';

export function createInventoryRouter(db: DB): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const storeId = req.query.storeId as string;
    if (!storeId) return res.json([]);
    const rows = db
      .prepare('SELECT * FROM inventory_items WHERE store_id = ? ORDER BY sort_order, id')
      .all(storeId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        store_id: r.store_id,
        name: r.name,
        quantity: r.quantity,
        photo: r.photo,
        status: r.status,
        sort_order: r.sort_order,
      })),
    );
  });

  router.post('/', requireAuth, (req, res, next) => {
    try {
      const { store_id, name, quantity, status, sort_order } = req.body as any;
      if (!store_id || !name) throw new ApiError(400, 'store_id/name 必填');
      const info = db
        .prepare('INSERT INTO inventory_items (store_id, name, quantity, status, sort_order) VALUES (?, ?, ?, ?, ?)')
        .run(store_id, name, quantity ?? 0, status || 'normal', sort_order ?? 0);
      sseManager.broadcastDataChange({ type: 'inventory', storeId: store_id });
      res.json({ id: info.lastInsertRowid, ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', requireAuth, (req, res, next) => {
    try {
      const { name, quantity, status, sort_order } = req.body as any;
      const row = db.prepare('SELECT store_id FROM inventory_items WHERE id = ?').get(req.params.id) as any;
      db.prepare(
        'UPDATE inventory_items SET name = COALESCE(?, name), quantity = COALESCE(?, quantity), status = COALESCE(?, status), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      ).run(name ?? null, quantity ?? null, status ?? null, sort_order ?? null, req.params.id);
      if (row) sseManager.broadcastDataChange({ type: 'inventory', storeId: row.store_id });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT store_id FROM inventory_items WHERE id = ?').get(req.params.id) as any;
      db.prepare('DELETE FROM inventory_items WHERE id = ?').run(req.params.id);
      if (row) sseManager.broadcastDataChange({ type: 'inventory', storeId: row.store_id });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
