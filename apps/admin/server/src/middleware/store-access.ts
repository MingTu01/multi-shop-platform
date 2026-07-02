// 店铺级数据隔离守卫
// ADMIN 可跨店操作；其他角色只能操作本店（user.storeId 必须匹配）
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.js';

// 校验当前用户是否有权操作目标 storeId
export function assertStoreAccess(req: Request, storeId: string | number): void {
  const user = req.user;
  if (!user) throw new ApiError(401, '未登录');
  if (user.role === 'ADMIN') return;
  if (user.storeId == null) {
    throw new ApiError(403, '未绑定店铺，无权操作');
  }
  if (String(user.storeId) !== String(storeId)) {
    throw new ApiError(403, '无权操作其他店铺数据');
  }
}

// Express 中间件形式：从 body 或 query 读取 storeId 并校验
export function storeAccessFromBody(req: Request, _res: Response, next: NextFunction) {
  try {
    const storeId = (req.body?.store_id ?? req.body?.storeId) as string | undefined;
    if (!storeId) throw new ApiError(400, 'store_id 必填');
    assertStoreAccess(req, storeId);
    next();
  } catch (e) {
    next(e);
  }
}

// 从 query 校验（GET 列表）
export function assertStoreQueryAccess(req: Request): string {
  const storeId = req.query.storeId as string | undefined;
  if (!storeId) return '';
  assertStoreAccess(req, storeId);
  return storeId;
}
