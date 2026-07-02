// 排班/开闭店记录页
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Table, Empty } from '@msp/ui';
import { formatDate } from '@msp/shared';

interface Shift {
  id: number;
  time?: string;
  type?: string;
  operator_name?: string;
  note?: string;
}

export function ShiftsPage() {
  const { data, loading, error } = useGatewayApi<Shift[]>('/shifts');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">排班/开闭店</h1>
      <Card title="开闭店记录">
        <Table<Shift>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无记录" />}
          columns={[
            { key: 'time', title: '时间', render: (r) => formatDate(r.time || '') },
            { key: 'type', title: '类型' },
            { key: 'operator_name', title: '操作人' },
            { key: 'note', title: '备注' },
          ]}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
