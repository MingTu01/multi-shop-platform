// 员工管理路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { hashPassword } from '../utils/password.js';
import { sseManager } from '../services/sse-manager.js';

export function createStaffRouter(db: DB): Router {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const storeId = req.query.storeId as string;
    if (!storeId) return res.json([]);
    const rows = db
      .prepare('SELECT * FROM users WHERE store_id = ? ORDER BY id')
      .all(Number(storeId)) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        username: r.username,
        name: r.name,
        role: r.role,
        store_id: r.store_id,
        store_name: r.store_name,
        phone: r.phone,
        avatar: r.avatar,
        address: r.address,
        salary: r.salary,
        status: r.status,
        job_title: r.job_title,
      })),
    );
  });

  router.post('/', requireAuth, requireRole('ADMIN', 'STORE_ADMIN', 'MANAGER'), (req, res, next) => {
    try {
      const { username, password, name, role, store_id, phone, salary, job_title } = req.body as any;
      if (!username || !password || !name || !role) throw new ApiError(400, 'username/password/name/role 必填');
      const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existing) throw new ApiError(409, '用户名已存在');
      const info = db
        .prepare(
          'INSERT INTO users (username, password_hash, name, role, store_id, phone, salary, job_title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .run(username, hashPassword(password), name, role, store_id ?? null, phone || null, salary ?? null, job_title || null);
      if (store_id) {
        sseManager.broadcastDataChange({ type: 'staff', storeId: String(store_id) });
      }
      res.json({ id: info.lastInsertRowid, ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', requireAuth, requireRole('ADMIN', 'STORE_ADMIN', 'MANAGER'), (req, res, next) => {
    try {
      const { name, role, phone, salary, job_title, status, store_id } = req.body as any;
      const row = db.prepare('SELECT store_id FROM users WHERE id = ?').get(req.params.id) as any;
      db.prepare(
        'UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), phone = COALESCE(?, phone), salary = COALESCE(?, salary), job_title = COALESCE(?, job_title), status = COALESCE(?, status), store_id = COALESCE(?, store_id) WHERE id = ?',
      ).run(name ?? null, role ?? null, phone ?? null, salary ?? null, job_title ?? null, status ?? null, store_id ?? null, req.params.id);
      if (row?.store_id) sseManager.broadcastDataChange({ type: 'staff', storeId: String(row.store_id) });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', requireAuth, requireRole('ADMIN', 'STORE_ADMIN'), (req, res, next) => {
    try {
      const row = db.prepare('SELECT store_id FROM users WHERE id = ?').get(req.params.id) as any;
      db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
      if (row?.store_id) sseManager.broadcastDataChange({ type: 'staff', storeId: String(row.store_id) });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
