// push-core 内部共享类型
import type { NotifyType, NotifyParams } from '@msp/shared';

// 模板渲染上下文
export interface TemplateContext {
  type: NotifyType;
  params: NotifyParams;
  operatorName?: string;
}

// 模板函数：根据上下文生成推送内容
export type TemplateFn = (ctx: TemplateContext) => {
  title: string;
  content: string;
  link?: string;
};

// 调度规则（轻量 cron）
export interface CronRule {
  hour: number; // 0-23
  minute: number; // 0-59
  dayOfWeek?: number; // 0-6 (0 = Sunday)
  dayOfMonth?: number; // 1-31
}

export interface SchedulerOpts {
  now?: () => Date;
  tickMs?: number;
}

// 推送日志接口（由宿主注入）
export interface PushLogger {
  info: (msg: string) => void;
  error: (msg: string, err?: unknown) => void;
}
