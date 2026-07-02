// JWT + Cookie 鉴权中间件
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { EnvConfig } from '../config/env.js';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  storeId?: number | null;
}

// 扩展 Express Request 类型
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function createAuthMiddleware(config: EnvConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 优先读 cookie
    let token: string | undefined;
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      token = cookieToken;
    } else {
      // 兼容 Authorization header
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        token = auth.slice(7);
      }
    }

    if (!token) {
      return next();
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = payload;
    } catch {
      // token 无效，忽略（视为未登录）
    }
    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录或登录已过期' });
  }
  next();
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// 角色守卫：要求用户具备任一指定角色
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}
