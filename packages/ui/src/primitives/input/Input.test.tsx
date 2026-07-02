import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders label and value', () => {
    render(<Input label="用户名" value="alice" onChange={() => undefined} />);
    expect(screen.getByText('用户名')).toBeTruthy();
    expect((screen.getByDisplayValue('alice') as HTMLInputElement).value).toBe('alice');
  });

  it('displays error message', () => {
    render(<Input value="" onChange={() => undefined} error="不能为空" />);
    expect(screen.getByText('不能为空')).toBeTruthy();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onChange with new value', () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="输入" />);
    fireEvent.change(screen.getByPlaceholderText('输入'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('renders prefix node', () => {
    render(
      <Input value="" onChange={() => undefined} prefix={<span data-testid="prefix">¥</span>} />,
    );
    expect(screen.getByTestId('prefix')).toBeTruthy();
  });
});
