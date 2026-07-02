// @msp/push-core - 推送核心包
// 纯 Node 逻辑，Repo 接口注入，可在任意后端环境使用

// 类型
export type { TemplateFn, TemplateContext, CronRule, SchedulerOpts, PushLogger } from './types.js';

// 仓储接口
export type { UserRepo, PushSettingsRepo, NotifyRepo, PushDeps, StoresRepo, NotifyInsertInput, NotifyParams } from './repos/interfaces.js';

// 渠道
export type { PushChannel, ChannelSendOptions, ChannelSendResult } from './channels/channel.js';
export { BaseHttpChannel, PushPlusChannel, WecomChannel, IyuuChannel } from './channels/index.js';

// 模板
export { getTemplate, registerTemplate, DEFAULT_TEMPLATES } from './templates/index.js';

// 核心
export { PushService } from './core/push-service.js';
export { buildParams } from './core/trigger.js';

// 调度
export { RetryQueue } from './scheduler/queue.js';
export type { RetryQueueOpts } from './scheduler/queue.js';
export { Scheduler, registerReportSchedules } from './scheduler/scheduler.js';

// 安全
export { assertSafeUrl, isSafeUrl } from './security/url-guard.js';
