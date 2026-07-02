// 每日报表页（日期选择 + 调用 /reports/daily）
import { useState } from 'react';
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Empty, Input, Button } from '@msp/ui';
import { formatMoney, localDate } from '@msp/shared';

interface DailyReport {
  date: string;
  store_id: string;
  breakdown: Array<{ type: string; count: number; total: number }>;
}

export function ReportsPage() {
  const [date, setDate] = useState(localDate());
  const { data, loading, error, reload } = useGatewayApi<DailyReport>(`/reports/daily?date=${date}`, [date]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">每日报表</h1>

      <Card title="日期选择" className="mb-4">
        <div className="flex gap-2 items-end">
          <div className="w-48">
            <Input type="date" value={date} onChange={setDate} />
          </div>
          <Button size="sm" onClick={reload}>查询</Button>
        </div>
      </Card>

      <Card title={`日报 - ${date}`}>
        {loading ? (
          <p className="text-slate-400 py-8 text-center">加载中...</p>
        ) : data?.breakdown?.length ? (
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">类型</th>
                <th className="text-right py-2">笔数</th>
                <th className="text-right py-2">金额</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map((b, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-2">{b.type}</td>
                  <td className="py-2 text-right">{b.count}</td>
                  <td className="py-2 text-right">{formatMoney(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty title="当日无数据" />
        )}
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    </div>
  );
}
