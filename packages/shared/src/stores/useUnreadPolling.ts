import { useEffect } from 'react';
import { useNotificationStore } from './notification.js';

/**
 * 共享的未读通知轮询钩子
 * 使用 SSE 事件驱动更新，降级为 30s 轮询
 */
export function useUnreadPolling() {
  const fetchUnread = useNotificationStore((s) => s.fetchUnread);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, [fetchUnread]);
}
