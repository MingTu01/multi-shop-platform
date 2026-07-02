// 通知列表页（需 userId 查询参数）
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Table, Empty, Input } from '@msp/ui';
import { formatDate } from '@msp/shared';
import type { Notification } from '@msp/shared';

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId') || '';
  const [userId, setUserId] = useState(userIdParam);

  const url = userIdParam ? `/notifications?userId=${userIdParam}` : null;
  const { data, loading, error } = useGatewayApi<Notification[]>(url, [userIdParam]);

  const handleQuery = () => {
    setSearchParams(userId ? { userId } : {});
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">通知中心</h1>

      <Card title="查询条件" className="mb-4">
        <div className="flex gap-2 items-end">
          <div className="w-48">
            <Input
              type="number"
              value={userId}
              onChange={setUserId}
              placeholder="用户 ID"
            />
          </div>
          <button
            type="button"
            onClick={handleQuery}
            className="h-9 px-4 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            查询
          </button>
        </div>
        {!userIdParam && <p className="mt-2 text-xs text-slate-400">请输入用户 ID 后查询（网关按用户隔离通知）</p>}
      </Card>

      <Card title="通知列表">
        <Table<Notification>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无通知" />}
          columns={[
            { key: 'title', title: '标题', render: (r) => <span className={r.read ? 'text-slate-400' : 'font-medium'}>{r.title}</span> },
            { key: 'created_at', title: '时间', render: (r) => formatDate(r.created_at) },
          ]}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
