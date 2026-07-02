// 服务入口
import { loadEnv } from './config/env.js';
import { getDb, closeDb } from './db/connection.js';
import { initSchema, seedDefaultData } from './db/schema.js';
import { bootstrapPush } from './services/push-bootstrap.js';
import { createApp } from './app.js';

function main() {
  const config = loadEnv();
  const db = getDb(config);

  // 初始化 schema 与默认数据
  initSchema(db);
  seedDefaultData(db);

  // 装配推送服务
  const pushRuntime = bootstrapPush(db, config);

  const app = createApp({ db, config, pushService: pushRuntime.pushService });

  const server = app.listen(config.port, () => {
    console.log(`[admin] server listening on :${config.port} (${config.nodeEnv})`);
  });

  // 启动调度器
  pushRuntime.scheduler.start();

  const shutdown = (sig: string) => {
    console.log(`[admin] received ${sig}, shutting down...`);
    pushRuntime.stop();
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
