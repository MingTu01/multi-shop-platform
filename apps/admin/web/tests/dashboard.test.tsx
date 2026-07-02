import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../src/routes/DashboardPage.js';

// mock @msp/shared useApi 间接依赖：mock api 模块
vi.mock('@msp/shared', async () => {
  const actual = await vi.importActual('@msp/shared');
  return {
    ...actual,
    api: {
      get: vi.fn().mockResolvedValue({ entry_count: 5, entry_total: 1000, store_count: 2, staff_count: 3 }),
    },
  };
});

describe('DashboardPage', () => {
  it('渲染仪表盘标题', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('仪表盘')).toBeTruthy();
  });
});
