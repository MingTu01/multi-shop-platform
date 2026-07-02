import { describe, it, expect } from 'vitest';
import { defineTemplateConfig } from '../core/config-schema.js';

describe('defineTemplateConfig', () => {
  it('有效配置应用默认值', () => {
    const c = defineTemplateConfig({ name: '测试', version: '0.5.0' });
    expect(c.features.inventory).toBe(true);
    expect(c.features.dividends).toBe(true);
    expect(c.features.pushSettings).toBe(true);
    expect(c.theme.primary).toBe('#16a34a');
    expect(c.routes).toEqual([]);
  });

  it('显式 features 覆盖默认值', () => {
    const c = defineTemplateConfig({
      name: 'x',
      version: '0.5.0',
      features: { dividends: false },
    });
    expect(c.features.dividends).toBe(false);
    expect(c.features.inventory).toBe(true);
  });

  it('缺少必填字段抛错', () => {
    // 缺少 version
    expect(() => defineTemplateConfig({ name: 'x' })).toThrow();
  });

  it('非法类型抛错', () => {
    expect(() => defineTemplateConfig({ name: 123, version: '0.5.0' } as any)).toThrow();
    expect(() =>
      defineTemplateConfig({ name: 'x', version: '0.5.0', features: { inventory: 'yes' as any } }),
    ).toThrow();
  });
});
