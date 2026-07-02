// 环境配置
export interface EnvConfig {
  port: number;
  jwtSecret: string;
  dbPath: string;
  uploadsDir: string;
  dataDir: string;
  nodeEnv: string;
  corsOrigin: string;
}

export function loadEnv(overrides: Partial<EnvConfig> = {}): EnvConfig {
  return {
    port: Number(process.env.PORT) || 3001,
    jwtSecret: process.env.JWT_SECRET || 'msp-dev-secret-change-me',
    dbPath: process.env.DB_PATH || './data/store.db',
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
    dataDir: process.env.DATA_DIR || './data',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '',
    ...overrides,
  };
}
