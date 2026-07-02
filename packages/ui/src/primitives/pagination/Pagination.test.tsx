import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders correct number of pages when total is small', () => {
    render(<Pagination current={1} pageSize={10} total={30} onChange={() => undefined} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.queryByText('4')).toBeNull();
  });

  it('marks current page as aria-current', () => {
    render(<Pagination current={2} pageSize={10} total={30} onChange={() => undefined} />);
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('1').getAttribute('aria-current')).toBeNull();
  });

  it('disables prev on first page and next on last page', () => {
    const { rerender } = render(<Pagination current={1} pageSize={10} total={30} onChange={() => undefined} />);
    expect(screen.getByLabelText('上一页')).toHaveAttribute('disabled');
    expect(screen.getByLabelText('下一页')).not.toHaveAttribute('disabled');

    rerender(<Pagination current={3} pageSize={10} total={30} onChange={() => undefined} />);
    expect(screen.getByLabelText('上一页')).not.toHaveAttribute('disabled');
    expect(screen.getByLabelText('下一页')).toHaveAttribute('disabled');
  });

  it('calls onChange with target page', () => {
    const onChange = vi.fn();
    render(<Pagination current={1} pageSize={10} total={30} onChange={onChange} />);
    fireEvent.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByLabelText('下一页'));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('shows ellipsis when many pages', () => {
    render(<Pagination current={5} pageSize={10} total={100} onChange={() => undefined} />);
    // 包含省略号
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });
});
