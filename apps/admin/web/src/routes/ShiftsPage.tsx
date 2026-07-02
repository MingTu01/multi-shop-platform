import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty } from '@msp/ui';
import { formatDate } from '@msp/shared';

export function ShiftsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data, loading } = useApi<any[]>(storeId ? `/shifts?storeId=${storeId}` : null, [storeId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/stores" className="text-sm text-slate-500 hover:underline">店铺管理</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">排班/开闭店 - {storeId}</h1>
      </div>
      <Card title="开闭店记录">
        <Table<any>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无记录" />}
          columns={[
            { key: 'time', title: '时间', render: (r) => formatDate(r.time) },
            { key: 'type', title: '类型' },
            { key: 'operator_name', title: '操作人' },
            { key: 'note', title: '备注' },
          ]}
        />
      </Card>
    </div>
  );
}
