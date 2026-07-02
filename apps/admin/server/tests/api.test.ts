// API 集成测试 - 使用内存 SQLite
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import type { Database as DB } from 'better-sqlite3';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initSchema, seedDefaultData } from '../src/db/schema.js';
import { hashPassword } from '../src/utils/password.js';
import { signToken } from '../src/middleware/auth.js';
import { ensureStoreToken } from '../src/routes/gateway.js';
import type { EnvConfig } from '../src/config/env.js';
import type { Express } from 'express';

const TEST_CONFIG: EnvConfig = {
  port: 0,
  jwtSecret: 'test-secret',
  dbPath: ':memory:',
  uploadsDir: './uploads-test',
  dataDir: './data-test',
  nodeEnv: 'test',
  corsOrigin: '',
};

function makeTestDb(): DB {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function seedTestData(db: DB) {
  // 管理员
  db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin',
    hashPassword('admin123'),
    '管理员',
    'ADMIN',
  );
  // 店铺
  db.prepare('INSERT INTO stores (id, name, is_open, initial_capital) VALUES (?, ?, ?, ?)').run(
    'S001',
    '示例店铺',
    1,
    100000,
  );
  // 店铺管理员 + 员工 + 股东
  db.prepare('INSERT INTO users (username, password_hash, name, role, store_id, store_name) VALUES (?, ?, ?, ?, ?, ?)').run(
    'storeadmin',
    hashPassword('sa123'),
    '店铺管理员',
    'STORE_ADMIN',
    1,
    '示例店铺',
  );
  db.prepare('INSERT INTO users (username, password_hash, name, role, store_id) VALUES (?, ?, ?, ?, ?)').run(
    'staff1',
    hashPassword('s123'),
    '员工一',
    'STAFF',
    1,
  );
  db.prepare('INSERT INTO users (username, password_hash, name, role, store_id) VALUES (?, ?, ?, ?, ?)').run(
    'sh1',
    hashPassword('sh123'),
    '股东一',
    'SHAREHOLDER',
    1,
  );
  // 股东记录
  db.prepare('INSERT INTO shareholders (store_id, name, ratio) VALUES (?, ?, ?)').run('S001', '股东一', 0.5);
}

function adminToken(userId = 1): string {
  return signToken({ userId, username: 'admin', role: 'ADMIN', storeId: null }, TEST_CONFIG.jwtSecret);
}

function staffToken(userId = 3): string {
  return signToken({ userId, username: 'staff1', role: 'STAFF', storeId: 1 }, TEST_CONFIG.jwtSecret);
}

describe('admin-server API', () => {
  let db: DB;
  let app: Express;

  beforeAll(() => {
    db = makeTestDb();
    seedTestData(db);
    app = createApp({ db, config: TEST_CONFIG }) as unknown as Express;
  });

  afterAll(() => {
    db.close();
  });

  describe('健康检查', () => {
    it('GET /api/health 返回 ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('认证', () => {
    it('正确账密登录成功', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('admin');
      expect(res.body.token).toBeTruthy();
    });

    it('错误密码登录失败', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('未带 token 访问 /me 返回 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('带 token 访问 /me 返回用户信息', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('admin');
    });
  });

  describe('店铺', () => {
    it('获取店铺列表', async () => {
      const res = await request(app).get('/api/stores').set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].id).toBe('S001');
    });

    it('管理员创建店铺', async () => {
      const res = await request(app)
        .post('/api/stores')
        .set('Authorization', 'Bearer ' + adminToken())
        .send({ id: 'S002', name: '新店铺' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('S002');
    });

    it('员工不能创建店铺（403）', async () => {
      const res = await request(app)
        .post('/api/stores')
        .set('Authorization', 'Bearer ' + staffToken())
        .send({ id: 'S003', name: '不应成功' });
      expect(res.status).toBe(403);
    });
  });

  describe('记账', () => {
    it('新增记账', async () => {
      const res = await request(app)
        .post('/api/entries')
        .set('Authorization', 'Bearer ' + adminToken())
        .send({ store_id: 'S001', type: 'income', amount: 200, date: '2024-01-15', note: '午餐' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('获取记账列表', async () => {
      const res = await request(app)
        .get('/api/entries?storeId=S001')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].amount).toBe(200);
    });
  });

  describe('库存', () => {
    it('新增库存项', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer ' + adminToken())
        .send({ store_id: 'S001', name: '大米', quantity: 50 });
      expect(res.status).toBe(200);
    });

    it('获取库存列表', async () => {
      const res = await request(app)
        .get('/api/inventory?storeId=S001')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('通知', () => {
    it('获取未读数', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('count');
    });
  });

  describe('推送设置', () => {
    it('获取推送设置（首次自动初始化）', async () => {
      const res = await request(app)
        .get('/api/push/settings')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      // daily_report 默认 true
      expect(res.body.push_daily_report).toBe(true);
    });

    it('更新推送设置', async () => {
      const res = await request(app)
        .put('/api/push/settings')
        .set('Authorization', 'Bearer ' + adminToken())
        .send({ pushplus_token: 'T123', push_weekly_report: true });
      expect(res.status).toBe(200);
      const get = await request(app)
        .get('/api/push/settings')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(get.body.pushplus_token).toBe('T123');
      expect(get.body.push_weekly_report).toBe(true);
    });
  });

  describe('报表', () => {
    it('仪表盘返回统计数据', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard?storeId=S001')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('entry_count');
      expect(res.body).toHaveProperty('store_count');
    });

    it('每日报表', async () => {
      const res = await request(app)
        .get('/api/reports/daily?storeId=S001&date=2024-01-15')
        .set('Authorization', 'Bearer ' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.date).toBe('2024-01-15');
    });
  });

  describe('API 进店通道（网关）', () => {
    it('无 Token 访问被拒', async () => {
      const res = await request(app).get('/api/gateway/v1/store');
      expect(res.status).toBe(401);
    });

    it('无效 Token 访问被拒', async () => {
      const res = await request(app).get('/api/gateway/v1/store').set('Authorization', 'Bearer bad_token');
      expect(res.status).toBe(401);
    });

    it('有效店铺 Token 可访问本店信息', async () => {
      const token = ensureStoreToken(db, 'S001');
      const res = await request(app)
        .get('/api/gateway/v1/store')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('S001');
    });

    it('网关记账列表只返回本店数据', async () => {
      // 先在 S002 插入一条记账
      db.prepare('INSERT INTO entries (store_id, type, amount, date) VALUES (?, ?, ?, ?)').run('S002', 'income', 999, '2024-01-15');
      const token = ensureStoreToken(db, 'S001');
      const res = await request(app)
        .get('/api/gateway/v1/entries')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      // S001 的记账不应包含 S002 的 999
      const amounts = res.body.map((e: any) => e.amount);
      expect(amounts).not.toContain(999);
    });

    it('网关访问其他店铺用户通知被拒（数据隔离）', async () => {
      const token = ensureStoreToken(db, 'S001');
      // 尝试用 S001 的 token 查询不存在的用户（属于其他店）
      const res = await request(app)
        .get('/api/gateway/v1/notifications?userId=999')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(403);
    });

    it('OpenAPI 文档无需鉴权即可访问', async () => {
      const res = await request(app).get('/api/gateway/v1/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
      expect(res.body.paths['/store']).toBeDefined();
      expect(res.body.paths['/entries']).toBeDefined();
      expect(res.body.components.securitySchemes.StoreToken).toBeDefined();
    });

    it('网关新增记账成功', async () => {
      const token = ensureStoreToken(db, 'S001');
      const res = await request(app)
        .post('/api/gateway/v1/entries')
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'income', amount: 500, date: '2024-01-15', category: '销售', note: '测试' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.id).toBeGreaterThan(0);
    });

    it('网关记账缺失字段返回 400', async () => {
      const token = ensureStoreToken(db, 'S001');
      const res = await request(app)
        .post('/api/gateway/v1/entries')
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'income' });
      expect(res.status).toBe(400);
    });

    it('网关每日报表按类型聚合', async () => {
      const token = ensureStoreToken(db, 'S001');
      await request(app)
        .post('/api/gateway/v1/entries')
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'income', amount: 100, date: '2024-02-01' });
      await request(app)
        .post('/api/gateway/v1/entries')
        .set('Authorization', 'Bearer ' + token)
        .send({ type: 'income', amount: 200, date: '2024-02-01' });
      const res = await request(app)
        .get('/api/gateway/v1/reports/daily?date=2024-02-01')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(200);
      expect(res.body.date).toBe('2024-02-01');
      const incomeRow = res.body.breakdown.find((b: any) => b.type === 'income');
      expect(incomeRow.count).toBe(2);
      expect(incomeRow.total).toBe(300);
    });

    it('店铺 Token 管理接口：ADMIN 可生成 Token', async () => {
      const res = await request(app)
        .post('/api/stores/S001/token')
        .set('Cookie', 'token=' + adminToken());
      expect(res.status).toBe(200);
      expect(res.body.store_id).toBe('S001');
      expect(res.body.token).toMatch(/^msp_S001_/);
    });

    it('店铺 Token 管理接口：非 ADMIN 拒绝', async () => {
      const res = await request(app)
        .post('/api/stores/S001/token')
        .set('Cookie', 'token=' + staffToken());
      expect(res.status).toBe(403);
    });

    it('店铺 Token 管理接口：轮换后旧 Token 失效', async () => {
      const oldToken = ensureStoreToken(db, 'S001');
      // 轮换
      const rotateRes = await request(app)
        .put('/api/stores/S001/token')
        .set('Cookie', 'token=' + adminToken());
      expect(rotateRes.status).toBe(200);
      expect(rotateRes.body.token).not.toBe(oldToken);
      // 旧 Token 应被拒
      const res1 = await request(app)
        .get('/api/gateway/v1/store')
        .set('Authorization', 'Bearer ' + oldToken);
      expect(res1.status).toBe(401);
      // 新 Token 可用
      const res2 = await request(app)
        .get('/api/gateway/v1/store')
        .set('Authorization', 'Bearer ' + rotateRes.body.token);
      expect(res2.status).toBe(200);
    });

    it('店铺 Token 管理接口：撤销后 Token 立即失效', async () => {
      const token = ensureStoreToken(db, 'S001');
      const revokeRes = await request(app)
        .delete('/api/stores/S001/token')
        .set('Cookie', 'token=' + adminToken());
      expect(revokeRes.status).toBe(200);
      expect(revokeRes.body.revoked).toBe(true);
      const res = await request(app)
        .get('/api/gateway/v1/store')
        .set('Authorization', 'Bearer ' + token);
      expect(res.status).toBe(401);
    });
  });
});
