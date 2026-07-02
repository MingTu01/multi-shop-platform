import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App.js';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('无 token 时重定向到 /login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    // 应回到 TokenEntryPage
    expect(screen.getByText('店铺端登录')).toBeTruthy();
  });
});
