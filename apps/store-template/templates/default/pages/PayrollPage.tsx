// 工资记录页
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Table, Empty } from '@msp/ui';
import { formatMoney } from '@msp/shared';

interface Payroll {
  id: number;
  user_name?: string;
  amount: number;
  period?: string;
  status?: string;
}

export function PayrollPage() {
  const { data, loading, error } = useGatewayApi<Payroll[]>('/payroll');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">工资管理</h1>
      <Card title="工资记录">
        <Table<Payroll>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无工资记录" />}
          columns={[
            { key: 'user_name', title: '员工' },
            { key: 'amount', title: '金额', align: 'right', render: (r) => formatMoney(r.amount) },
            { key: 'period', title: '周期' },
            { key: 'status', title: '状态' },
          ]}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
