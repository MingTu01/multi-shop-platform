import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty, Button } from '@msp/ui';
import { api, useNotificationStore, formatDate } from '@msp/shared';
import type { Notification } from '@msp/shared';

export function NotificationsPage() {
  const { data, loading, reload } = useApi<Notification[]>('/notifications');
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  const handleRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`, {});
    decrementUnread(1);
    reload();
  };

  const handleReadAll = async () => {
    await api.put('/notifications/read-all', {});
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">通知中心</h1>
        <Button variant="secondary" size="sm" onClick={handleReadAll}>全部已读</Button>
      </div>
      <Card>
        <Table<Notification>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无通知" />}
          columns={[
            { key: 'title', title: '标题', render: (r) => <span className={r.read ? 'text-slate-400' : 'font-medium'}>{r.title}</span> },
            { key: 'created_at', title: '时间', render: (r) => formatDate(r.created_at) },
            {
              key: 'actions',
              title: '操作',
              render: (r) => (!r.read ? <Button size="sm" variant="text" onClick={() => handleRead(r.id)}>标为已读</Button> : <span className="text-slate-300 text-sm">已读</span>),
            },
          ]}
        />
      </Card>
    </div>
  );
}
