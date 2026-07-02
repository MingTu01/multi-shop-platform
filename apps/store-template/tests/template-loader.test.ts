import { describe, it, expect } from 'vitest';
import { resolveTemplate, registerTemplate, getTemplate } from '../core/template-loader.js';

describe('template-loader', () => {
  it('resolveTemplate(S1) 返回默认通用模板', () => {
    const c = resolveTemplate('S1');
    expect(c.name).toBe('通用模板');
    expect(c.features.dividends).toBe(true);
    expect(c.theme.primary).toBe('#16a34a');
  });

  it('resolveTemplate(S1-retail) 返回零售示例模板（dividends 关闭）', () => {
    const c = resolveTemplate('S1-retail');
    expect(c.name).toBe('零售示例');
    expect(c.features.dividends).toBe(false);
    expect(c.theme.primary).toBe('#0ea5e9');
  });

  it('resolveTemplate(null) 返回默认模板', () => {
    expect(resolveTemplate(null).name).toBe('通用模板');
  });

  it('registerTemplate / getTemplate 工作', () => {
    registerTemplate('custom', { name: '自定义', version: '0.5.0' });
    const c = getTemplate('custom');
    expect(c).toBeDefined();
    expect(c!.name).toBe('自定义');
    expect(getTemplate('not-exist')).toBeUndefined();
  });

  it('无效配置在 registerTemplate 时抛错', () => {
    expect(() => registerTemplate('bad', { name: 123 })).toThrow();
  });
});
