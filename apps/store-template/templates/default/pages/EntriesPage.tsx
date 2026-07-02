// 记账管理页（列表 + 新增）
import { useState } from 'react';
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { gatewayApi } from '../../../src/lib/gatewayApi.js';
import { Card, Button, Table, Empty, Select, Input } from '@msp/ui';
import { formatMoney, formatDate, localDate } from '@msp/shared';
import type { Entry } from '@msp/shared';

export function EntriesPage() {
  const { data, loading, reload, error } = useGatewayApi<Entry[]>('/entries');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(localDate());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAdd = async () => {
    if (!amount) {
      setMsg('请输入金额');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await gatewayApi.post('/entries', {
        type,
        category: category || undefined,
        amount: Number(amount),
        note: note || undefined,
        date,
      });
      setAmount('');
      setCategory('');
      setNote('');
      reload();
    } catch (e: any) {
      setMsg(e?.message || '新增失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">记账管理</h1>

      <Card title="新增记账" className="mb-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="w-32">
            <Select
              value={type}
              onChange={setType}
              options={[
                { label: '收入', value: 'income' },
                { label: '支出', value: 'expense' },
              ]}
            />
          </div>
          <Input value={category} onChange={setCategory} placeholder="分类" />
          <Input type="number" value={amount} onChange={setAmount} placeholder="金额" />
          <Input value={note} onChange={setNote} placeholder="备注" />
          <Input type="date" value={date} onChange={setDate} />
          <Button size="sm" loading={saving} onClick={handleAdd}>添加</Button>
        </div>
        {msg && <p className="mt-2 text-xs text-rose-600">{msg}</p>}
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
            { key: 'category', title: '分类' },
            { key: 'amount', title: '金额', align: 'right', render: (r) => <span className={r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>{formatMoney(r.amount)}</span> },
            { key: 'note', title: '备注' },
          ]}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
