// Express 应用装配（可被测试 import）
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Database as DB } from 'better-sqlite3';
import type { EnvConfig } from './config/env.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { errorHandler as errorMiddleware } from './middleware/error.js';
import { createAuthRouter } from './routes/auth.js';
import { createStoresRouter } from './routes/stores.js';
import { createEntriesRouter } from './routes/entries.js';
import { createInventoryRouter } from './routes/inventory.js';
import { createShiftsRouter } from './routes/shifts.js';
import { createPayrollRouter } from './routes/payroll.js';
import { createDividendsRouter } from './routes/dividends.js';
import { createStaffRouter } from './routes/staff.js';
import { createNotificationsRouter } from './routes/notifications.js';
import { createPushSettingsRouter } from './routes/push.js';
import { createSseRouter } from './routes/sse.js';
import { createReportsRouter } from './routes/reports.js';
import { createLogsRouter } from './routes/logs.js';
import { createSystemRouter } from './routes/system.js';
import { createGatewayRouter } from './routes/gateway.js';
import { createTemplatesRouter } from './routes/templates.js';
import type { PushService } from '@msp/push-core';

export interface AppDeps {
  db: DB;
  config: EnvConfig;
  pushService?: PushService;
}

export function createApp({ db, config, pushService }: AppDeps): express.Application {
  const app = express();

  app.use(cors(config.corsOrigin ? { origin: config.corsOrigin, credentials: true } : undefined));
  app.use(express.json());
  app.use(cookieParser());

  // 鉴权中间件（解析 token，不强制）
  app.use(createAuthMiddleware(config));

  // 健康检查（无需鉴权）
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // 业务路由
  app.use('/api/auth', createAuthRouter(db, config));
  app.use('/api/stores', createStoresRouter(db));
  app.use('/api/entries', createEntriesRouter(db, pushService));
  app.use('/api/inventory', createInventoryRouter(db));
  app.use('/api/stores/:storeId/shifts', (req, _res, next) => {
    // 兼容 /api/stores/:storeId/shifts 路径
    req.query.storeId = req.params.storeId;
    next();
  }, createShiftsRouter(db, pushService));
  app.use('/api/shifts', createShiftsRouter(db, pushService));
  app.use('/api/payroll', createPayrollRouter(db, pushService));
  app.use('/api/dividends', createDividendsRouter(db, pushService));
  app.use('/api/staff', createStaffRouter(db));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.use('/api/push/settings', createPushSettingsRouter(db));
  app.use('/api/sse', createSseRouter());
  app.use('/api/reports', createReportsRouter(db));
  app.use('/api/logs', createLogsRouter(db));
  app.use('/api/system', createSystemRouter(db));

  // 模板管理（Phase 5 扩展）
  app.use('/api/templates', createTemplatesRouter(db));

  // API 进店通道（Phase 6）
  app.use('/api/gateway/v1', createGatewayRouter(db));

  // 错误处理（注册错误中间件）
  app.use(errorMiddleware);

  return app;
}
