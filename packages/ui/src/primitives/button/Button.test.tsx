import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>提交</Button>);
    expect(screen.getByRole('button', { name: '提交' })).toBeTruthy();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>默认</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-blue-600');
  });

  it('applies secondary variant classes when set', () => {
    render(<Button variant="secondary">次要</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-white');
  });

  it('applies danger variant classes when set', () => {
    render(<Button variant="danger">删除</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-rose-600');
  });

  it('applies size classes', () => {
    render(<Button size="lg">大</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-11');
  });

  it('disables and shows spinner when loading', () => {
    render(<Button loading>加载</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('disabled');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.querySelector('.animate-spin')).toBeTruthy();
  });

  it('respects explicit disabled', () => {
    render(<Button disabled>禁用</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>点我</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        禁用
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
