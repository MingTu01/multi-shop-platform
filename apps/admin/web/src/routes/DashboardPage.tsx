import { useApi } from '../hooks/useApi.js';
import { useStore, formatMoney } from '@msp/shared';
import { GlassCard } from '../components/GlassCard.js';
import {
  LayoutDashboard,
  BookOpen,
  Store,
  Users,
  ArrowRight,
  CheckCircle2,
  Bell,
  Calendar,
} from 'lucide-react';

export function DashboardPage() {
  const user = useStore((s) => s.user);
  const storeId = user?.store_id ?? 'S001';
  const { data: stats } = useApi<any>(`/reports/dashboard?storeId=${storeId}`);

  const statCards = [
    {
      label: '记账条数',
      value: stats?.entry_count ?? 0,
      sub: '本月新增记账记录',
      icon: BookOpen,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      label: '记账总额',
      value: '¥' + formatMoney(stats?.entry_total ?? 0),
      sub: '本月收入总额',
      icon: ArrowRight,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: '店铺数量',
      value: stats?.store_count ?? 0,
      sub: '已开通店铺数',
      icon: Store,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
    },
    {
      label: '员工数量',
      value: stats?.staff_count ?? 0,
      sub: '在职员工总数',
      icon: Users,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  const quickActions = [
    { label: '管理店铺', to: '/stores', icon: Store },
    { label: '查看报表', to: '/reports', icon: LayoutDashboard },
    { label: '通知中心', to: '/notifications', icon: Bell },
    { label: '模板管理', to: '/templates', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-xs text-slate-400">欢迎回来，{user?.name || '管理员'}</p>
        </div>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <GlassCard
              key={card.label}
              className="msp-slide-in p-5"
              onClick={undefined}
            >
              <div
                className={'mb-3 flex h-10 w-10 items-center justify-center rounded-xl ' + card.bg}
              >
                <Icon className={'h-5 w-5 ' + card.color} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{card.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{card.label}</div>
              <div className="mt-0.5 text-xs text-slate-400">{card.sub}</div>
              <span className="sr-only">{i}</span>
            </GlassCard>
          );
        })}
      </div>

      {/* 快捷操作区 */}
      <GlassCard className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          快捷操作
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.to}
                href={action.to}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 p-4 text-center transition-all hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-600">{action.label}</span>
              </a>
            );
          })}
        </div>
      </GlassCard>

      {/* 今日概览 */}
      <GlassCard className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          今日概览
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div className="text-sm">
              <span className="text-slate-500">系统运行</span>
              <span className="ml-2 font-semibold text-emerald-600">正常</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
            <Bell className="h-5 w-5 text-indigo-500" />
            <div className="text-sm">
              <span className="text-slate-500">待处理通知</span>
              <span className="ml-2 font-semibold text-indigo-600">
                {stats?.unread_count ?? 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
            <Calendar className="h-5 w-5 text-amber-500" />
            <div className="text-sm">
              <span className="text-slate-500">今日日期</span>
              <span className="ml-2 font-semibold text-amber-600">
                {new Date().toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
