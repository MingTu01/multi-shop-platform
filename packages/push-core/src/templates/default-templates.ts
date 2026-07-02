// 17 种通知类型的默认内容模板
import type { NotifyType, NotifyParams } from '@msp/shared';
import { getNotifyTitle, getNotifyLink } from '@msp/shared';
import type { TemplateFn, TemplateContext } from '../types.js';

function base(ctx: TemplateContext, fallback: string): { title: string; content: string; link?: string } {
  const { params, operatorName } = ctx;
  const title = getNotifyTitle(ctx.type);
  const link = getNotifyLink(ctx.type, params.storeId);
  const who = operatorName || params.operatorName ? (operatorName || params.operatorName) + ' ' : '';
  const detail = params.detail ? '：' + params.detail : '';
  const content = (who + fallback + detail).trim() || params.action || title;
  return { title, content, link };
}

export const DEFAULT_TEMPLATES: Record<NotifyType, TemplateFn> = {
  entry: (ctx) => base(ctx, '新增记账'),
  payroll: (ctx) => base(ctx, '工资信息更新'),
  dividend: (ctx) => base(ctx, '分红发放'),
  inventory: (ctx) => base(ctx, '库存盘点'),
  shift: (ctx) => base(ctx, '开闭店操作'),
  health_cert: (ctx) => base(ctx, '健康证到期提醒'),
  staff: (ctx) => base(ctx, '员工信息变更'),
  store: (ctx) => base(ctx, '门店信息变更'),
  purchase: (ctx) => base(ctx, '进货记录'),
  salary_confirm: (ctx) => base(ctx, '工资确认'),
  inventory_alert: (ctx) => base(ctx, '库存预警'),
  store_alert: (ctx) => base(ctx, '门店预警'),
  daily_report: (ctx) => base(ctx, '每日经营简报已生成'),
  weekly_report: (ctx) => base(ctx, '每周经营报告已生成'),
  monthly_report: (ctx) => base(ctx, '月度经营报告已生成'),
  review_reminder: (ctx) => base(ctx, '有待处理事项需要审核'),
  alert: (ctx) => base(ctx, '系统告警'),
};

export function getTemplate(type: NotifyType): TemplateFn {
  return DEFAULT_TEMPLATES[type] || ((ctx: TemplateContext) => base(ctx, ctx.params.action || '系统通知'));
}

// 复用 NotifyParams 类型，避免未使用告警
export type { NotifyParams };
