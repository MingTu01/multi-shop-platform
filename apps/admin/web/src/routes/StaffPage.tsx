import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { Card, Table, Empty, RoleBadge } from '@msp/ui';
import type { UserInfo } from '@msp/shared';

export function StaffPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data, loading } = useApi<UserInfo[]>(storeId ? `/staff?storeId=${storeId}` : null, [storeId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/stores" className="text-sm text-slate-500 hover:underline">店铺管理</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">员工管理 - {storeId}</h1>
      </div>
      <Card title="员工列表">
        <Table<UserInfo>
          loading={loading}
          rowKey={(r) => String(r.id)}
          data={data || []}
          empty={<Empty title="暂无员工" />}
          columns={[
            { key: 'name', title: '姓名' },
            { key: 'username', title: '用户名' },
            { key: 'role', title: '角色', render: (r) => <RoleBadge role={r.role} /> },
            { key: 'phone', title: '电话' },
            { key: 'job_title', title: '职位' },
          ]}
        />
      </Card>
    </div>
  );
}
