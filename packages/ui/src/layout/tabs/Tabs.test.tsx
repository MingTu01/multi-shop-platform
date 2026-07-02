import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, type TabItem } from './Tabs';

const items: TabItem[] = [
  { key: 'a', label: '标签A', children: <div>内容A</div> },
  { key: 'b', label: '标签B', children: <div>内容B</div> },
  { key: 'c', label: '标签C', children: <div>内容C</div> },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs items={items} activeKey="a" onChange={() => undefined} />);
    expect(screen.getByText('标签A')).toBeTruthy();
    expect(screen.getByText('标签B')).toBeTruthy();
    expect(screen.getByText('标签C')).toBeTruthy();
  });

  it('shows active tab content only', () => {
    render(<Tabs items={items} activeKey="a" onChange={() => undefined} />);
    expect(screen.getByText('内容A')).toBeTruthy();
    expect(screen.queryByText('内容B')).toBeNull();
  });

  it('marks active tab with aria-selected', () => {
    render(<Tabs items={items} activeKey="b" onChange={() => undefined} />);
    const tabA = screen.getByText('标签A').closest('[role="tab"]');
    const tabB = screen.getByText('标签B').closest('[role="tab"]');
    expect(tabA?.getAttribute('aria-selected')).toBe('false');
    expect(tabB?.getAttribute('aria-selected')).toBe('true');
  });

  it('calls onChange when clicking a tab', () => {
    const onChange = vi.fn();
    render(<Tabs items={items} activeKey="a" onChange={onChange} />);
    fireEvent.click(screen.getByText('标签B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('does not call onChange for disabled tab', () => {
    const onChange = vi.fn();
    const itemsWithDisabled: TabItem[] = [
      { key: 'a', label: 'A', children: <div>A</div> },
      { key: 'b', label: 'B', children: <div>B</div>, disabled: true },
    ];
    render(<Tabs items={itemsWithDisabled} activeKey="a" onChange={onChange} />);
    fireEvent.click(screen.getByText('B'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
