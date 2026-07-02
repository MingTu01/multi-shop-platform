// 店铺管理路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { ensureStoreToken, resetStoreToken, revokeStoreToken } from './gateway.js';

export function createStoresRouter(db: DB): Router {
  const router = Router();

  // 店铺列表
  router.get('/', requireAuth, (_req, res) => {
    const rows = db.prepare('SELECT * FROM stores ORDER BY id').all() as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        initial_capital: r.initial_capital,
        is_open: r.is_open,
        status: r.status,
        staff_count: r.staff_count,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    );
  });

  // 单个店铺
  router.get('/:id', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id) as any;
      if (!row) throw new ApiError(404, '店铺不存在');
      const shareholders = db
        .prepare('SELECT * FROM shareholders WHERE store_id = ?')
        .all(req.params.id) as any[];
      res.json({ ...row, shareholders });
    } catch (e) {
      next(e);
    }
  });

  // 创建店铺
  router.post('/', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const { id, name, address, initial_capital } = req.body as any;
      if (!id || !name) throw new ApiError(400, '店铺 id 和 name 必填');
      db.prepare('INSERT INTO stores (id, name, address, initial_capital) VALUES (?, ?, ?, ?)').run(
        id,
        name,
        address || null,
        initial_capital || 0,
      );
      res.json({ id, name, address, initial_capital: initial_capital || 0, is_open: 1 });
    } catch (e) {
      next(e);
    }
  });

  // 更新店铺
  router.put('/:id', requireAuth, requireRole('ADMIN', 'STORE_ADMIN'), (req, res, next) => {
    try {
      const { name, address, initial_capital, is_open, status } = req.body as any;
      db.prepare(
        'UPDATE stores SET name = COALESCE(?, name), address = COALESCE(?, address), initial_capital = COALESCE(?, initial_capital), is_open = COALESCE(?, is_open), status = COALESCE(?, status), updated_at = datetime(\'now\') WHERE id = ?',
      ).run(name ?? null, address ?? null, initial_capital ?? null, is_open ?? null, status ?? null, req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  // 删除店铺
  router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      db.prepare('DELETE FROM stores WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  // 生成或复用店铺 Token（仅 ADMIN）
  router.post('/:id/token', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const row = db.prepare('SELECT 1 FROM stores WHERE id = ?').get(req.params.id);
      if (!row) throw new ApiError(404, '店铺不存在');
      const token = ensureStoreToken(db, req.params.id);
      res.json({ store_id: req.params.id, token });
    } catch (e) {
      next(e);
    }
  });

  // 重置（轮换）店铺 Token（仅 ADMIN）
  router.put('/:id/token', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      const row = db.prepare('SELECT 1 FROM stores WHERE id = ?').get(req.params.id);
      if (!row) throw new ApiError(404, '店铺不存在');
      const token = resetStoreToken(db, req.params.id);
      res.json({ store_id: req.params.id, token, rotated: true });
    } catch (e) {
      next(e);
    }
  });

  // 撤销店铺 Token（仅 ADMIN）
  router.delete('/:id/token', requireAuth, requireRole('ADMIN'), (req, res, next) => {
    try {
      revokeStoreToken(db, req.params.id);
      res.json({ store_id: req.params.id, revoked: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
