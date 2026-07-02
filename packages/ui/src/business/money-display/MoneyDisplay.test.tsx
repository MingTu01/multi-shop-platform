import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoneyDisplay } from './MoneyDisplay';

vi.mock('@msp/shared', () => ({
  formatMoney: (n: number) => `M(${n})`,
}));

describe('MoneyDisplay', () => {
  it('renders currency prefix and formatMoney output', () => {
    render(<MoneyDisplay value={123} />);
    expect(screen.getByText('¥M(123)')).toBeTruthy();
  });

  it('uses custom currency', () => {
    render(<MoneyDisplay value={50} currency="$" />);
    expect(screen.getByText('$M(50)')).toBeTruthy();
  });

  it('applies red class for negative when colored', () => {
    render(<MoneyDisplay value={-10} colored />);
    const el = screen.getByText('¥M(-10)');
    expect(el.className).toContain('text-rose-600');
  });

  it('applies green class for positive when colored', () => {
    render(<MoneyDisplay value={10} colored />);
    const el = screen.getByText('¥M(10)');
    expect(el.className).toContain('text-emerald-600');
  });

  it('does not apply color classes when not colored', () => {
    render(<MoneyDisplay value={10} />);
    const el = screen.getByText('¥M(10)');
    expect(el.className).not.toContain('text-emerald-600');
  });
});
