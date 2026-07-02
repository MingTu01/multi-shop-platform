import { useApi } from '../hooks/useApi.js';
import { useStore } from '@msp/shared';
import { formatMoney } from '@msp/shared';
import { IconMoney, IconStore, IconUsers, IconChart, IconCheck, IconBell, IconCalendar } from '@msp/ui';

export function DashboardPage() {
  const user = useStore((s) => s.user);
  const storeId = user?.store_id ?? 'S001';

  const { data: stats } = useApi<any>(`/reports/dashboard?storeId=${storeId}`);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <IconChart size={24} className="text-[var(--msp-primary)]" />
        <h1 className="text-2xl font-bold text-[var(--msp-text)]">仪表盘</h1>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 记账条数 */}
        <div className="msp-stat-card msp-slide-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--msp-text-muted)]">记账条数</span>
            <IconMoney size={20} className="text-[var(--msp-primary)]" />
          </div>
          <div className="msp-stat-value">{stats?.entry_count ?? 0}</div>
          <div className="msp-stat-label">本月新增记账记录</div>
        </div>

        {/* 记账总额 */}
        <div className="msp-stat-card msp-slide-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--msp-text-muted)]">记账总额</span>
            <div className="text-[var(--msp-success)] font-bold">¥</div>
          </div>
          <div className="msp-stat-value text-[var(--msp-success)]">
            {formatMoney(stats?.entry_total ?? 0)}
          </div>
          <div className="msp-stat-label">本月收入总额</div>
        </div>

        {/* 店铺数量 */}
        <div className="msp-stat-card msp-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--msp-text-muted)]">店铺数量</span>
            <IconStore size={20} className="text-[var(--msp-info)]" />
          </div>
          <div className="msp-stat-value text-[var(--msp-info)]">{stats?.store_count ?? 0}</div>
          <div className="msp-stat-label">已开通店铺数</div>
        </div>

        {/* 员工数量 */}
        <div className="msp-stat-card msp-slide-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--msp-text-muted)]">员工数量</span>
            <IconUsers size={20} className="text-[var(--msp-warning)]" />
          </div>
          <div className="msp-stat-value text-[var(--msp-warning)]">{stats?.staff_count ?? 0}</div>
          <div className="msp-stat-label">在职员工总数</div>
        </div>
      </div>

      {/* 快捷操作区 */}
      <div className="msp-card">
        <h2 className="text-lg font-semibold text-[var(--msp-text)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--msp-primary)]" />
          快捷操作
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/stores" className="msp-btn msp-btn-secondary">
            <IconStore size={18} />
            管理店铺
          </a>
          <a href="/reports" className="msp-btn msp-btn-secondary">
            <IconChart size={18} />
            查看报表
          </a>
          <a href="/notifications" className="msp-btn msp-btn-secondary">
            <IconMoney size={18} />
            通知中心
          </a>
          <a href="/templates" className="msp-btn msp-btn-secondary">
            <IconUsers size={18} />
            模板管理
          </a>
        </div>
      </div>

      {/* 今日概览 */}
      <div className="msp-card">
        <h2 className="text-lg font-semibold text-[var(--msp-text)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--msp-success)]" />
          今日概览
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--msp-success-light)]">
            <IconCheck size={18} className="text-[var(--msp-success)]" />
            <div>
              <span className="text-[var(--msp-text-muted)]">系统运行</span>
              <span className="ml-2 font-semibold text-[var(--msp-success)]">正常</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--msp-primary-light)]">
            <IconBell size={18} className="text-[var(--msp-primary)]" />
            <div>
              <span className="text-[var(--msp-text-muted)]">待处理通知</span>
              <span className="ml-2 font-semibold text-[var(--msp-primary)]">0</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--msp-warning-light)]">
            <IconCalendar size={18} className="text-[var(--msp-warning)]" />
            <div>
              <span className="text-[var(--msp-text-muted)]">今日日期</span>
              <span className="ml-2 font-semibold text-[var(--msp-warning)]">
                {new Date().toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}