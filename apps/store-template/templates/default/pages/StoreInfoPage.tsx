// 本店信息页
import { useGatewayApi } from '../../../src/lib/useGatewayApi.js';
import { Card, Badge, Empty } from '@msp/ui';
import { formatMoney } from '@msp/shared';
import type { StoreInfo } from '@msp/shared';

interface GatewayStoreInfo {
  id: string;
  name: string;
  address?: string;
  is_open: number;
  initial_capital?: number;
}

export function StoreInfoPage() {
  const { data, loading, error } = useGatewayApi<GatewayStoreInfo>('/store');

  if (loading) {
    return <p className="text-slate-400">加载中...</p>;
  }
  if (error) {
    return <p className="text-rose-600">{error}</p>;
  }
  if (!data) {
    return <Empty title="未获取到店铺信息" />;
  }

  const info: StoreInfo = {
    id: data.id,
    name: data.name,
    address: data.address,
    is_open: data.is_open,
    initial_capital: data.initial_capital,
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">本店信息</h1>
      <Card title={info.name}>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-slate-500">店铺 ID</dt>
          <dd className="text-slate-800">{info.id}</dd>
          <dt className="text-slate-500">营业状态</dt>
          <dd>
            <Badge color={info.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
              {info.is_open ? '营业中' : '已闭店'}
            </Badge>
          </dd>
          <dt className="text-slate-500">地址</dt>
          <dd className="text-slate-800">{info.address || '—'}</dd>
          <dt className="text-slate-500">初始资金</dt>
          <dd className="text-slate-800">{info.initial_capital != null ? formatMoney(info.initial_capital) : '—'}</dd>
        </dl>
      </Card>
    </div>
  );
}
