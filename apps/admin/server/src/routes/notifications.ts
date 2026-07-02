// 通知路由
import { Router } from 'express';
import type { Database as DB } from 'better-sqlite3';
import { requireAuth } from '../middleware/auth.js';

export function createNotificationsRouter(db: DB): Router {
  const router = Router();

  // 通知列表
  router.get('/', requireAuth, (req, res) => {
    const rows = db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 100')
      .all(req.user!.userId) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        link: r.link,
        type: r.type,
        detail: r.detail,
        read: r.read,
        created_at: r.created_at,
      })),
    );
  });

  // 未读数
  router.get('/unread-count', requireAuth, (req, res) => {
    const row = db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0')
      .get(req.user!.userId) as { count: number };
    res.json({ count: row.count });
  });

  // 标记已读
  router.put('/:id/read', requireAuth, (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(
      req.params.id,
      req.user!.userId,
    );
    res.json({ ok: true });
  });

  // 全部已读
  router.put('/read-all', requireAuth, (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user!.userId);
    res.json({ ok: true });
  });

  return router;
}
