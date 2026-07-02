// 通用数据拉取 hook（基于 gatewayApi，store-token 鉴权）
import { useEffect, useState, useCallback } from 'react';
import { gatewayApi } from './gatewayApi.js';

export interface UseGatewayApi<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useGatewayApi<T>(url: string | null, deps: unknown[] = []): UseGatewayApi<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    gatewayApi
      .get(url)
      .then((d) => {
        if (!cancelled) {
          setData(d as T);
          setError(null);
        }
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message || '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, tick, ...deps]);

  return { data, loading, error, reload };
}
