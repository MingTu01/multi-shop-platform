// API 进店通道网关（Phase 6）
// 店铺级 Token 鉴权 + 数据隔离 + 按 Token 限流 + OpenAPI
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import type { Database as DB } from 'better-sqlite3';
import { PUSH_TYPE_CONFIGS } from '@msp/shared';
import { sseManager } from '../services/sse-manager.js';

// 推送设置允许更新的字段白名单（防止 SQL 列名注入 / 覆盖主键）
const PUSH_SETTINGS_ALLOWED_KEYS = new Set<string>([
  'pushplus_token',
  'wecom_secret',
  'iyuu_token',
  ...PUSH_TYPE_CONFIGS.map((c) => c.key),
]);

// 扩展 Request 携带 storeId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      gatewayStoreId?: string;
    }
  }
}

// 从请求中提取 store token（用于限流 key）
function extractToken(req: any): string {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.headers['x-store-token']) return String(req.headers['x-store-token']);
  return req.ip || 'unknown';
}

// 按 Token 维度限流：每个店铺 100 次/15 分钟
export const gatewayRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => extractToken(req),
  message: { error: '请求过于频繁，请稍后再试' },
});

// 店铺级 Token 鉴权中间件
export function storeTokenAuth(db: DB) {
  return (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    let token: string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.slice(7);
    } else if (req.headers['x-store-token']) {
      token = String(req.headers['x-store-token']);
    }
    if (!token) {
      return res.status(401).json({ error: '缺少店铺 Token' });
    }
    const row = db.prepare('SELECT store_id FROM store_tokens WHERE token = ?').get(token) as { store_id: string } | undefined;
    if (!row) {
      return res.status(401).json({ error: '店铺 Token 无效' });
    }
    req.gatewayStoreId = row.store_id;
    next();
  };
}

// 为店铺生成/重置 token（若已存在则覆盖）
export function resetStoreToken(db: DB, storeId: string): string {
  const token = generateToken(storeId);
  db.prepare('DELETE FROM store_tokens WHERE store_id = ?').run(storeId);
  db.prepare('INSERT INTO store_tokens (store_id, token) VALUES (?, ?)').run(storeId, token);
  return token;
}

// 为店铺生成或复用 token
export function ensureStoreToken(db: DB, storeId: string): string {
  const existing = db.prepare('SELECT token FROM store_tokens WHERE store_id = ?').get(storeId) as { token: string } | undefined;
  if (existing) return existing.token;
  const token = generateToken(storeId);
  db.prepare('INSERT INTO store_tokens (store_id, token) VALUES (?, ?)').run(storeId, token);
  return token;
}

// 撤销店铺 token
export function revokeStoreToken(db: DB, storeId: string): void {
  db.prepare('DELETE FROM store_tokens WHERE store_id = ?').run(storeId);
}

function generateToken(storeId: string): string {
  const rand = crypto.randomBytes(24).toString('hex');
  return `msp_${storeId}_${rand}`;
}

// OpenAPI 文档（公开访问，无需鉴权）
export function getOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: '店铺端 API 进店通道',
      version: '0.6.0',
      description: '店铺级 Token 鉴权 + 数据隔离，供店铺端模板应用调用',
    },
    servers: [{ url: '/api/gateway/v1', description: '当前实例' }],
    components: {
      securitySchemes: {
        StoreToken: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Bearer <store_token>',
        },
      },
    },
    security: [{ StoreToken: [] }],
    paths: {
      '/store': {
        get: { summary: '本店信息', tags: ['Store'] },
      },
      '/entries': {
        get: { summary: '本店记账列表', tags: ['Entry'] },
        post: {
          summary: '本店新增记账',
          tags: ['Entry'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'amount', 'date'],
                  properties: {
                    type: { type: 'string' },
                    category: { type: 'string' },
                    amount: { type: 'number' },
                    note: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                  },
                },
              },
            },
          },
        },
      },
      '/inventory': { get: { summary: '本店库存', tags: ['Inventory'] } },
      '/shifts': { get: { summary: '本店排班', tags: ['Shift'] } },
      '/payroll': { get: { summary: '本店工资', tags: ['Payroll'] } },
      '/reports/daily': {
        get: {
          summary: '本店每日报表',
          tags: ['Report'],
          parameters: [
            { name: 'date', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
          ],
        },
      },
      '/notifications': {
        get: {
          summary: '本店通知',
          tags: ['Notification'],
          parameters: [
            { name: 'userId', in: 'query', required: true, schema: { type: 'integer' } },
          ],
        },
      },
      '/push/settings': {
        put: {
          summary: '本店推送设置更新',
          tags: ['Push'],
          parameters: [
            { name: 'userId', in: 'query', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
  };
}

export function createGatewayRouter(db: DB): Router {
  const router = Router();

  // OpenAPI 文档（公开访问，无需鉴权，无需限流）
  router.get('/openapi.json', (_req, res) => {
    res.json(getOpenApiSpec());
  });

  // 所有进店 API 需店铺 Token + 按 Token 限流
  router.use(gatewayRateLimiter);
  router.use(storeTokenAuth(db));

  // 本店信息
  router.get('/store', (req, res) => {
    const row = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.gatewayStoreId) as any;
    if (!row) return res.status(404).json({ error: '店铺不存在' });
    res.json({
      id: row.id,
      name: row.name,
      address: row.address,
      is_open: row.is_open,
      initial_capital: row.initial_capital,
    });
  });

  // 本店分配的模板配置（供店铺端模板应用拉取）
  router.get('/template', (req, res) => {
    const assign = db.prepare('SELECT template_id FROM store_template_assignments WHERE store_id = ?').get(req.gatewayStoreId) as { template_id: string } | undefined;
    const tplId = assign?.template_id || 'default';
    const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(tplId) as any;
    if (!row) return res.json({ template_id: 'default', config: null });
    let config: any = null;
    try { config = JSON.parse(row.config_json); } catch { config = {}; }
    res.json({ template_id: row.id, name: row.name, version: row.version, config });
  });

  // 本店记账列表（强制 storeId 隔离）
  router.get('/entries', (req, res) => {
    const rows = db
      .prepare('SELECT * FROM entries WHERE store_id = ? ORDER BY date DESC, id DESC LIMIT 200')
      .all(req.gatewayStoreId) as any[];
    res.json(rows);
  });

  // 本店新增记账
  router.post('/entries', (req, res) => {
    const { type, category, amount, note, date } = req.body as any;
    if (!type || amount === undefined || !date) {
      return res.status(400).json({ error: 'type/amount/date 必填' });
    }
    const info = db
      .prepare('INSERT INTO entries (store_id, type, category, amount, note, date) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.gatewayStoreId, type, category || null, amount, note || null, date);
    sseManager.broadcastDataChange({ type: 'entry', storeId: req.gatewayStoreId });
    res.json({ id: info.lastInsertRowid, ok: true });
  });

  // 本店库存
  router.get('/inventory', (req, res) => {
    const rows = db
      .prepare('SELECT * FROM inventory_items WHERE store_id = ? ORDER BY sort_order, id')
      .all(req.gatewayStoreId) as any[];
    res.json(rows);
  });

  // 本店排班
  router.get('/shifts', (req, res) => {
    const rows = db
      .prepare('SELECT * FROM shifts WHERE store_id = ? ORDER BY time DESC, id DESC LIMIT 200')
      .all(req.gatewayStoreId) as any[];
    res.json(rows);
  });

  // 本店工资
  router.get('/payroll', (req, res) => {
    const rows = db
      .prepare('SELECT * FROM payroll WHERE store_id = ? ORDER BY id DESC')
      .all(req.gatewayStoreId) as any[];
    res.json(rows);
  });

  // 本店每日报表
  router.get('/reports/daily', (req, res) => {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const rows = db
      .prepare("SELECT type, COUNT(*) as count, SUM(amount) as total FROM entries WHERE store_id = ? AND date = ? GROUP BY type")
      .all(req.gatewayStoreId, date) as any[];
    res.json({ date, store_id: req.gatewayStoreId, breakdown: rows });
  });

  // 本店通知（需 user_id，网关场景通常传 user_id 查询参数）
  router.get('/notifications', (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ error: 'userId 必填' });
    // 校验该用户属于本店
    const user = db.prepare('SELECT store_id FROM users WHERE id = ?').get(userId) as { store_id: number } | undefined;
    if (!user || String(user.store_id) !== String(req.gatewayStoreId)) {
      return res.status(403).json({ error: '用户不属于该店铺' });
    }
    const rows = db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 100')
      .all(userId) as any[];
    res.json(rows);
  });

  // 本店推送设置更新（按 user_id）
  router.put('/push/settings', (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ error: 'userId 必填' });
    const user = db.prepare('SELECT store_id FROM users WHERE id = ?').get(userId) as { store_id: number } | undefined;
    if (!user || String(user.store_id) !== String(req.gatewayStoreId)) {
      return res.status(403).json({ error: '用户不属于该店铺' });
    }
    const body = req.body as Record<string, any>;
    const exists = db.prepare('SELECT 1 FROM push_settings WHERE user_id = ?').get(userId);
    if (!exists) {
      db.prepare('INSERT INTO push_settings (user_id) VALUES (?)').run(userId);
    }
    const sets: string[] = [];
    const vals: any[] = [];
    for (const [k, v] of Object.entries(body)) {
      if (!PUSH_SETTINGS_ALLOWED_KEYS.has(k)) continue;
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
    if (sets.length > 0) {
      vals.push(userId);
      db.prepare(`UPDATE push_settings SET ${sets.join(', ')} WHERE user_id = ?`).run(...vals);
    }
    res.json({ ok: true });
  });

  return router;
}
