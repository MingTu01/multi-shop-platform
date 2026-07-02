import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PushTypeSwitch } from './PushTypeSwitch';
import { PUSH_TYPE_CONFIGS } from '@msp/shared';

describe('PushTypeSwitch', () => {
  it('renders all push type configs grouped by category', () => {
    render(<PushTypeSwitch value={{}} onChange={() => undefined} />);
    for (const cfg of PUSH_TYPE_CONFIGS) {
      expect(screen.getByText(cfg.label)).toBeTruthy();
    }
  });

  it('renders category headers', () => {
    render(<PushTypeSwitch value={{}} onChange={() => undefined} />);
    expect(screen.getByText('经营报表')).toBeTruthy();
    expect(screen.getByText('异常审核')).toBeTruthy();
    expect(screen.getByText('门店运营')).toBeTruthy();
    expect(screen.getByText('人事财务')).toBeTruthy();
  });

  it('filters by category when provided', () => {
    render(<PushTypeSwitch value={{}} onChange={() => undefined} category="经营报表" />);
    expect(screen.getByText('经营报表')).toBeTruthy();
    expect(screen.queryByText('异常审核')).toBeNull();
    // 经营报表下应有 daily/weekly/monthly report
    expect(screen.getByText('每日经营简报')).toBeTruthy();
  });

  it('reflects checked state via aria-checked', () => {
    const target = PUSH_TYPE_CONFIGS[0];
    render(<PushTypeSwitch value={{ [target.key]: true }} onChange={() => undefined} />);
    const switches = screen.getAllByRole('switch');
    const matched = switches.find((s) => s.getAttribute('aria-checked') === 'true');
    expect(matched).toBeTruthy();
  });

  it('calls onChange toggling the key when switch clicked', () => {
    const target = PUSH_TYPE_CONFIGS[0];
    const onChange = vi.fn();
    render(<PushTypeSwitch value={{ [target.key]: false }} onChange={onChange} />);
    // 找到第一行 label 的 switch
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual({ [target.key]: true });
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<PushTypeSwitch value={{}} onChange={onChange} disabled />);
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
