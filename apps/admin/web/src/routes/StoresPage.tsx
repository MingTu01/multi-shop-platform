import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { api } from '@msp/shared';
import { Card, Button, Table, Badge } from '@msp/ui';
import type { StoreInfo } from '@msp/shared';

export function StoresPage() {
  const { data, loading, reload } = useApi<StoreInfo[]>('/stores');
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newId || !newName) return;
    await api.post('/stores', { id: newId, name: newName });
    setNewId('');
    setNewName('');
    setCreating(false);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">店铺管理</h1>
        <Button onClick={() => setCreating(true)}>新建店铺</Button>
      </div>

      {creating && (
        <Card title="新建店铺" className="mb-4">
          <div className="flex gap-2 items-end">
            <input className="border rounded px-2 py-1 text-sm" placeholder="店铺ID" value={newId} onChange={(e) => setNewId(e.target.value)} />
            <input className="border rounded px-2 py-1 text-sm" placeholder="店铺名称" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button size="sm" onClick={handleCreate}>保存</Button>
            <Button size="sm" variant="text" onClick={() => setCreating(false)}>取消</Button>
          </div>
        </Card>
      )}

      <Card>
        <Table<StoreInfo>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          columns={[
            { key: 'id', title: 'ID' },
            { key: 'name', title: '店铺名称' },
            {
              key: 'is_open',
              title: '状态',
              render: (r) => <Badge color={r.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{r.is_open ? '营业中' : '已闭店'}</Badge>,
            },
            {
              key: 'actions',
              title: '操作',
              render: (r) => (
                <Link to={`/stores/${r.id}/entries`} className="text-emerald-600 hover:underline text-sm">
                  进入店铺
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
