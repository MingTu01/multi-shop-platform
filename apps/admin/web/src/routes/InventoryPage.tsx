import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty } from '@msp/ui';
import type { InventoryItem } from '@msp/shared';

export function InventoryPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data, loading } = useApi<InventoryItem[]>(storeId ? `/inventory?storeId=${storeId}` : null, [storeId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/stores" className="text-sm text-slate-500 hover:underline">店铺管理</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">库存管理 - {storeId}</h1>
      </div>
      <Card title="库存列表">
        <Table<InventoryItem>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无库存" />}
          columns={[
            { key: 'name', title: '名称' },
            { key: 'quantity', title: '数量' },
            { key: 'status', title: '状态' },
          ]}
        />
      </Card>
    </div>
  );
}
