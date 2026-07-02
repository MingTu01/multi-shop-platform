import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty } from '@msp/ui';
import { formatMoney } from '@msp/shared';

export function PayrollPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data, loading } = useApi<any[]>(storeId ? `/payroll?storeId=${storeId}` : null, [storeId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/stores" className="text-sm text-slate-500 hover:underline">店铺管理</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">工资管理 - {storeId}</h1>
      </div>
      <Card title="工资记录">
        <Table<any>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无工资记录" />}
          columns={[
            { key: 'user_name', title: '员工' },
            { key: 'amount', title: '金额', render: (r) => formatMoney(r.amount) },
            { key: 'period', title: '周期' },
            { key: 'status', title: '状态' },
          ]}
        />
      </Card>
    </div>
  );
}
