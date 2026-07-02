import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';
import { ROLE_CONFIG } from '@msp/shared';

describe('RoleBadge', () => {
  it('renders label from ROLE_CONFIG for ADMIN', () => {
    render(<RoleBadge role="ADMIN" />);
    expect(screen.getByText(ROLE_CONFIG.ADMIN.label)).toBeTruthy();
  });

  it('applies ROLE_CONFIG bg and color classes', () => {
    render(<RoleBadge role="MANAGER" />);
    const badge = screen.getByText(ROLE_CONFIG.MANAGER.label);
    expect(badge.className).toContain(ROLE_CONFIG.MANAGER.bg);
    expect(badge.className).toContain(ROLE_CONFIG.MANAGER.color);
  });

  it('renders for all known roles', () => {
    const roles = ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] as const;
    for (const role of roles) {
      const { unmount } = render(<RoleBadge role={role} />);
      expect(screen.getByText(ROLE_CONFIG[role].label)).toBeTruthy();
      unmount();
    }
  });
});
