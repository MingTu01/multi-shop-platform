import { useEffect } from 'react';
import { useNotificationStore } from '@msp/shared';
import { cn } from '../../_internal/cn';

export interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

/**
 * 通知铃铛 - 复用 @msp/shared useNotificationStore
 * 挂载时拉取未读数；点击触发 onClick
 */
export function NotificationBell({ onClick, className }: NotificationBellProps) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnread = useNotificationStore((s) => s.fetchUnread);

  useEffect(() => {
    void fetchUnread();
  }, [fetchUnread]);

  const display = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="通知"
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-testid="bell-icon">
        <path
          d="M12 3a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 16h14a1 1 0 0 0 .707-1.707L18 12.586V9a6 6 0 0 0-6-6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 18a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold leading-4 text-white"
          data-testid="unread-badge"
        >
          {display}
        </span>
      ) : null}
    </button>
  );
}
