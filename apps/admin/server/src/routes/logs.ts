// 操作日志路由
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { Database as DB } from 'better-sqlite3';

export function createLogsRouter(db: DB): Router {
  const router = Router();

  router.get('/', requireAuth, requireRole('ADMIN', 'STORE_ADMIN', 'MANAGER'), (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = db
      .prepare('SELECT * FROM operation_logs ORDER BY id DESC LIMIT ?')
      .all(limit) as any[];
    res.json(
      rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        user_name: r.user_name,
        action: r.action,
        target: r.target,
        ip: r.ip,
        time: r.time,
      })),
    );
  });

  return router;
}

// 记录操作日志的辅助函数
export function logOperation(
  db: DB,
  userId: number | undefined,
  userName: string | undefined,
  action: string,
  target?: string,
  ip?: string,
): void {
  try {
    db.prepare('INSERT INTO operation_logs (user_id, user_name, action, target, ip) VALUES (?, ?, ?, ?, ?)').run(
      userId ?? null,
      userName ?? null,
      action,
      target ?? null,
      ip ?? null,
    );
  } catch {
    // 日志失败不影响主流程
  }
}
