import { useApi } from '../hooks/useApi.js';
import { Card, Empty } from '@msp/ui';
import { formatMoney } from '@msp/shared';

interface Dashboard {
  entry_count: number;
  entry_total: number;
  store_count: number;
  staff_count: number;
}

export function DashboardPage() {
  const { data, loading, error } = useApi<Dashboard>('/reports/dashboard');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">仪表盘</h1>
      {loading && <p className="text-slate-400">加载中...</p>}
      {error && <p className="text-rose-600">{error}</p>}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="记账条数">
            <p className="text-2xl font-bold text-slate-800">{data.entry_count}</p>
          </Card>
          <Card title="记账总额">
            <p className="text-2xl font-bold text-emerald-600">{formatMoney(data.entry_total)}</p>
          </Card>
          <Card title="店铺数量">
            <p className="text-2xl font-bold text-slate-800">{data.store_count}</p>
          </Card>
          <Card title="员工数量">
            <p className="text-2xl font-bold text-slate-800">{data.staff_count}</p>
          </Card>
        </div>
      )}
      {!loading && !data && <Empty title="暂无数据" />}
    </div>
  );
}
