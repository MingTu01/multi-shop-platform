import type { NotifyType } from './types/notify.js';
import type { Role } from './types/notify.js';

// 推送类型完整配置（单一来源）
// 合并自：notify-trigger.ts TYPE_TO_PUSH_FIELD + notify.ts ROLE_ALLOWED_TYPES + PushSettingsModal.tsx PUSH_OPTIONS
export interface PushTypeConfig {
  key: string;                // 推送字段名（如 push_daily_report）
  type: NotifyType;           // 通知类型（如 daily_report）
  label: string;              // 显示标签
  title: string;              // 通知标题
  category: PushCategory;     // 分类
  roles: Role[];              // 允许接收的角色
  priority: 'high' | 'medium' | 'low';
  defaultSelected: boolean;
  link: (storeId?: string) => string;  // 跳转链接
}

export type PushCategory = '经营报表' | '异常审核' | '门店运营' | '人事财务';

// 推送分类颜色（UI 用，含 Tailwind class）
export const CATEGORY_COLORS: Record<PushCategory, { bg: string; bgOff: string; text: string; dot: string }> = {
  '经营报表': { bg: 'bg-blue-50 border-blue-200 text-blue-700', bgOff: 'bg-slate-50 text-slate-400', text: 'text-blue-700', dot: 'bg-blue-500' },
  '异常审核': { bg: 'bg-rose-50 border-rose-200 text-rose-700', bgOff: 'bg-slate-50 text-slate-400', text: 'text-rose-700', dot: 'bg-rose-500' },
  '门店运营': { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', bgOff: 'bg-slate-50 text-slate-400', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  '人事财务': { bg: 'bg-amber-50 border-amber-200 text-amber-700', bgOff: 'bg-slate-50 text-slate-400', text: 'text-amber-700', dot: 'bg-amber-500' },
};

// 推送类型完整配置表
export const PUSH_TYPE_CONFIGS: PushTypeConfig[] = [
  // 经营报表
  { key: 'push_daily_report',    type: 'daily_report',     label: '每日经营简报', title: '每日经营简报', category: '经营报表', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'], priority: 'medium', defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/entries' : '/dashboard' },
  { key: 'push_weekly_report',   type: 'weekly_report',    label: '每周经营报告', title: '每周经营报告', category: '经营报表', roles: ['ADMIN', 'STORE_ADMIN'],              priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/entries' : '/dashboard' },
  { key: 'push_monthly_report',  type: 'monthly_report',   label: '月度经营报告', title: '月度经营报告', category: '经营报表', roles: ['ADMIN', 'STORE_ADMIN'],              priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/entries' : '/dashboard' },
  // 异常与审核
  { key: 'push_alert',           type: 'alert',            label: '异常警告',     title: '系统告警',     category: '异常审核', roles: ['ADMIN', 'STORE_ADMIN'],              priority: 'high',   defaultSelected: true,  link: () => '/notifications' },
  { key: 'push_review_reminder', type: 'review_reminder',  label: '审核提醒',     title: '待处理事项提醒', category: '异常审核', roles: ['ADMIN', 'STORE_ADMIN'],            priority: 'medium', defaultSelected: false, link: () => '/notifications' },
  { key: 'push_inventory_alert', type: 'inventory_alert',  label: '库存异常',     title: '库存预警',     category: '异常审核', roles: ['ADMIN', 'STORE_ADMIN'],              priority: 'high',   defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/inventory' : '/inventory' },
  { key: 'push_store_alert',     type: 'store_alert',      label: '门店异常',     title: '门店预警',     category: '异常审核', roles: ['ADMIN'],                              priority: 'high',   defaultSelected: true,  link: () => '/stores' },
  // 门店运营
  { key: 'push_openclose_notify', type: 'shift',           label: '开闭店通知',   title: '开闭店通知',   category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'medium', defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/open-close' : '/open-close' },
  { key: 'push_bookkeeping_notify', type: 'entry',         label: '记账通知',     title: '记账通知',     category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/entries' : '/entries' },
  { key: 'push_inventory_notify', type: 'inventory',       label: '盘点通知',     title: '盘点通知',     category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/inventory' : '/inventory' },
  { key: 'push_purchase_notify',  type: 'purchase',        label: '进货通知',     title: '进货通知',     category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/purchase' : '/purchase' },
  { key: 'push_staff',            type: 'staff',           label: '员工通知',     title: '员工通知',     category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'low',    defaultSelected: false, link: (sid) => sid ? '/store/' + sid + '/staff' : '/staff' },
  { key: 'push_store',            type: 'store',           label: '门店通知',     title: '门店通知',     category: '门店运营', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'low',    defaultSelected: false, link: () => '/stores' },
  // 人事与财务
  { key: 'push_salary_confirm',  type: 'salary_confirm',   label: '工资确认通知', title: '工资确认',     category: '人事财务', roles: ['ADMIN', 'STORE_ADMIN', 'STAFF'],      priority: 'medium', defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/payroll' : '/payroll' },
  { key: 'push_dividend_notify', type: 'dividend',         label: '分红发放通知', title: '分红通知',     category: '人事财务', roles: ['SHAREHOLDER', 'ADMIN'],               priority: 'medium', defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/dividends' : '/dividends' },
  { key: 'push_health_cert',     type: 'health_cert',      label: '健康证到期提醒', title: '健康证通知',  category: '人事财务', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'],    priority: 'high',   defaultSelected: true,  link: (sid) => sid ? '/store/' + sid + '/staff' : '/staff' },
];

// 从 PUSH_TYPE_CONFIGS 生成的辅助映射（保持向后兼容）

// 通知类型 -> 推送字段名（原 TYPE_TO_PUSH_FIELD）
export const TYPE_TO_PUSH_FIELD: Record<string, string> = Object.fromEntries(
  PUSH_TYPE_CONFIGS.map(c => [c.type, c.key])
);

// 通知类型 -> 标题（原 getNotifyTitle）
export function getNotifyTitle(type: NotifyType): string {
  const config = PUSH_TYPE_CONFIGS.find(c => c.type === type);
  return config?.title || '系统通知';
}

// 通知类型 -> 跳转链接（原 linkMap）
export function getNotifyLink(type: NotifyType, storeId?: string): string {
  const config = PUSH_TYPE_CONFIGS.find(c => c.type === type);
  return config ? config.link(storeId) : '/notifications';
}

// 推送渠道配置
export interface ChannelDef {
  key: string;
  label: string;
  tokenKey: string;
  adminOnly?: boolean;
}

export const PUSH_CHANNELS: ChannelDef[] = [
  { key: 'pushplus', label: 'PushPlus', tokenKey: 'pushplus_token' },
  { key: 'wecom', label: '企业微信', tokenKey: 'wecom_secret', adminOnly: true },
  { key: 'iyuu', label: '爱语飞飞', tokenKey: 'iyuu_token' },
];

export const CHANNEL_TUTORIALS: Record<string, { url: string; desc: string }> = {
  pushplus: { url: 'https://www.pushplus.plus/push1.html', desc: '注册后获取Token' },
  wecom: { url: 'https://developer.work.weixin.qq.com/document/path/90236', desc: '创建自建应用获取配置' },
  iyuu: { url: 'https://iyuu.cn/', desc: '关注公众号获取Token' },
};
