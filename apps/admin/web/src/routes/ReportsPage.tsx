import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { Card, Empty, Tabs } from '@msp/ui';
import { formatMoney } from '@msp/shared';

export function ReportsPage() {
  const [active, setActive] = useState('daily');
  const [storeId] = useState('S001');
  const date = new Date().toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);

  const { data: daily } = useApi<any>(`/reports/daily?storeId=${storeId}&date=${date}`, [active]);
  const { data: monthly } = useApi<any>(`/reports/monthly?storeId=${storeId}&month=${month}`, [active]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">报表统计</h1>
      <Tabs
        activeKey={active}
        onChange={setActive}
        items={[
          {
            key: 'daily',
            label: '每日报表',
            children: (
              <Card title={`日报 - ${date}`}>
                {daily?.breakdown?.length ? (
                  <table className="w-full text-sm">
                    <thead className="text-slate-500 border-b">
                      <tr>
                        <th className="text-left py-2">类型</th>
                        <th className="text-right py-2">笔数</th>
                        <th className="text-right py-2">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daily.breakdown.map((b: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100">
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
              </Card>
            ),
          },
          {
            key: 'monthly',
            label: '月度报表',
            children: (
              <Card title={`月报 - ${month}`}>
                {monthly?.breakdown?.length ? (
                  <table className="w-full text-sm">
                    <thead className="text-slate-500 border-b">
                      <tr>
                        <th className="text-left py-2">日期</th>
                        <th className="text-left py-2">类型</th>
                        <th className="text-right py-2">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.breakdown.map((b: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-2">{b.date}</td>
                          <td className="py-2">{b.type}</td>
                          <td className="py-2 text-right">{formatMoney(b.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Empty title="当月无数据" />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
