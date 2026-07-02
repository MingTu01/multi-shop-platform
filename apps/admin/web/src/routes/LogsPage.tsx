import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty } from '@msp/ui';
import { formatDate } from '@msp/shared';

export function LogsPage() {
  const { data, loading } = useApi<any[]>('/logs?limit=100');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">操作日志</h1>
      <Card>
        <Table<any>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无日志" />}
          columns={[
            { key: 'time', title: '时间', render: (r) => formatDate(r.time) },
            { key: 'user_name', title: '操作人' },
            { key: 'action', title: '动作' },
            { key: 'target', title: '对象' },
            { key: 'ip', title: 'IP' },
          ]}
        />
      </Card>
    </div>
  );
}
