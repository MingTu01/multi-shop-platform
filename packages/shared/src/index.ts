// @msp/shared - 管理端与店铺端共享的纯逻辑包
// 包含：类型定义、角色权限、工具函数、API client、状态管理、SSE、推送配置

// 类型
export * from './types/index.js';
export type { Role, NotifyType, NotifyParams } from './types/notify.js';

// 角色与权限
export * from './role/index.js';

// 工具函数
export * from './utils/index.js';

// API client
export * from './api/index.js';
export * from './api/config.js';

// 状态管理
export * from './stores/index.js';

// SSE
export * from './sse/index.js';

// 推送配置
export * from './push-config.js';
