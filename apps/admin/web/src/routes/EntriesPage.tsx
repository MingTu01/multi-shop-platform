import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { api, formatMoney, formatDate } from '@msp/shared';
import { Card, Button, Table, Empty } from '@msp/ui';
import type { Entry } from '@msp/shared';

export function EntriesPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data, loading, reload } = useApi<Entry[]>(storeId ? `/entries?storeId=${storeId}` : null, [storeId]);
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = async () => {
    if (!storeId || !amount) return;
    await api.post('/entries', { store_id: storeId, type, amount: Number(amount), note, date });
    setAmount('');
    setNote('');
    reload();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/stores" className="text-sm text-slate-500 hover:underline">店铺管理</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">记账管理 - {storeId}</h1>
      </div>

      <Card title="新增记账" className="mb-4">
        <div className="flex flex-wrap gap-2 items-end">
          <select className="border rounded px-2 py-1 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
          <input className="border rounded px-2 py-1 text-sm w-28" type="number" placeholder="金额" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className="border rounded px-2 py-1 text-sm" placeholder="备注" value={note} onChange={(e) => setNote(e.target.value)} />
          <input className="border rounded px-2 py-1 text-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button size="sm" onClick={handleAdd}>添加</Button>
        </div>
      </Card>

      <Card title="记账记录">
        <Table<Entry>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<Empty title="暂无记账" />}
          columns={[
            { key: 'date', title: '日期', render: (r) => formatDate(r.date || '') },
            { key: 'type', title: '类型' },
            { key: 'amount', title: '金额', render: (r) => <span className={r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>{formatMoney(r.amount)}</span> },
            { key: 'note', title: '备注' },
            { key: 'creator_name', title: '操作人' },
          ]}
        />
      </Card>
    </div>
  );
}
