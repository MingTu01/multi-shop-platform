import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => undefined}>
        内容
      </Modal>,
    );
    expect(screen.queryByText('内容')).toBeNull();
  });

  it('renders title and children when open', () => {
    render(
      <Modal open onClose={() => undefined} title="确认">
        内容
      </Modal>,
    );
    expect(screen.getByText('确认')).toBeTruthy();
    expect(screen.getByText('内容')).toBeTruthy();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="确认">
        内容
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('关闭'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="确认">
        内容
      </Modal>,
    );
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing ESC', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="确认">
        内容
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop when disabled', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} closeOnBackdrop={false}>
        内容
      </Modal>,
    );
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders footer', () => {
    render(
      <Modal open onClose={() => undefined} footer={<button>确定</button>}>
        内容
      </Modal>,
    );
    expect(screen.getByText('确定')).toBeTruthy();
  });
});
