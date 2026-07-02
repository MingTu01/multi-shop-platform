import { useEffect, useState, useCallback } from 'react';
import { api } from '@msp/shared';
import { useDataVersion } from '@msp/shared';

// 通用数据拉取 hook，结合 SSE 版本号自动刷新
export function useApi<T>(url: string | null, deps: unknown[] = []): {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const version = useDataVersion('global');

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
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
  }, [url, tick, version, ...deps]);

  return { data, loading, error, reload };
}
