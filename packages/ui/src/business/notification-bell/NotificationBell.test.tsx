import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { mockFetchUnread, mockUseNotificationStore } = vi.hoisted(() => {
  const mockFetchUnread = vi.fn();
  const mockUseNotificationStore: any = vi.fn((selector?: any) => {
    const state = { unreadCount: 3, fetchUnread: mockFetchUnread };
    return selector ? selector(state) : state;
  });
  return { mockFetchUnread, mockUseNotificationStore };
});

vi.mock('@msp/shared', () => ({
  useNotificationStore: mockUseNotificationStore,
}));

import { NotificationBell } from './NotificationBell';

describe('NotificationBell', () => {
  it('renders bell svg', () => {
    render(<NotificationBell />);
    expect(screen.getByTestId('bell-icon')).toBeTruthy();
  });

  it('shows unread count badge', () => {
    render(<NotificationBell />);
    expect(screen.getByTestId('unread-badge').textContent).toBe('3');
  });

  it('calls fetchUnread on mount', () => {
    render(<NotificationBell />);
    expect(mockFetchUnread).toHaveBeenCalled();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<NotificationBell onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('通知'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
