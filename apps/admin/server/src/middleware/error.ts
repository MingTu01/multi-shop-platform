// 统一错误处理
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err.message);
  const status = (err as any).status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message;
  res.status(status).json({ error: message });
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
