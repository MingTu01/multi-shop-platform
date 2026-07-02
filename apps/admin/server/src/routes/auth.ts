// 认证路由：登录/登出/获取当前用户
import { Router } from 'express';
import { z } from 'zod';
import type { Database as DB } from 'better-sqlite3';
import { verifyPassword, hashPassword } from '../utils/password.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import type { EnvConfig } from '../config/env.js';
import { ApiError } from '../middleware/error.js';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function createAuthRouter(db: DB, config: EnvConfig): Router {
  const router = Router();

  // 登录
  router.post('/login', (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(400, '用户名或密码不能为空');
      }
      const { username, password } = parsed.data;
      const row = db.prepare('SELECT * FROM users WHERE username = ? AND status = ?').get(username, 'active') as any;
      if (!row || !verifyPassword(password, row.password_hash)) {
        throw new ApiError(401, '用户名或密码错误');
      }
      const token = signToken(
        { userId: row.id, username: row.username, role: row.role, storeId: row.store_id ?? null },
        config.jwtSecret,
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({
        user: {
          id: row.id,
          username: row.username,
          name: row.name,
          role: row.role,
          store_id: row.store_id ?? null,
          store_name: row.store_name ?? undefined,
        },
        token,
      });
    } catch (e) {
      next(e);
    }
  });

  // 登出
  router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
  });

  // 获取当前用户
  router.get('/me', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any;
      if (!row) throw new ApiError(404, '用户不存在');
      res.json({
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        store_id: row.store_id ?? null,
        store_name: row.store_name ?? undefined,
        phone: row.phone ?? undefined,
        avatar: row.avatar ?? undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  // 修改密码
  router.put('/password', requireAuth, (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        throw new ApiError(400, '新密码至少 6 位');
      }
      const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.userId) as any;
      if (!row || !verifyPassword(oldPassword, row.password_hash)) {
        throw new ApiError(400, '原密码错误');
      }
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), req.user!.userId);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
