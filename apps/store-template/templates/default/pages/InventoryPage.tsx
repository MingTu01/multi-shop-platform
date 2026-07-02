// 库存列表页
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Table, Empty, Badge } from '@msp/ui';
import type { InventoryItem } from '@msp/shared';

export function InventoryPage() {
  const { data, loading, error } = useGatewayApi<InventoryItem[]>('/inventory');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">库存管理</h1>
      <Card title="库存列表">
        <Table<InventoryItem>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无库存" />}
          columns={[
            { key: 'name', title: '名称' },
            { key: 'quantity', title: '数量', align: 'right' },
            { key: 'status', title: '状态', render: (r) => (
              <Badge color={r.status === 'normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                {r.status || '—'}
              </Badge>
            ) },
          ]}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
