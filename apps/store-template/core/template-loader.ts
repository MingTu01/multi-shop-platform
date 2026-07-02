// 模板运行时：按 store 配置加载模板
import { defineTemplateConfig, type TemplateConfig } from './config-schema.js';
import { defaultConfig } from '../templates/default/template.config.js';
import { retailDemoConfig } from '../templates/retail-demo/template.config.js';

// 模板注册表
const registry = new Map<string, TemplateConfig>();

// 注册模板（校验配置）
export function registerTemplate(id: string, config: unknown): TemplateConfig {
  const parsed = defineTemplateConfig(config);
  registry.set(id, parsed);
  return parsed;
}

// 获取模板（未注册返回 undefined）
export function getTemplate(id: string): TemplateConfig | undefined {
  return registry.get(id);
}

// 内置模板注册（模块加载时执行）
registerTemplate('default', defaultConfig);
registerTemplate('retail-demo', retailDemoConfig);

// 按 storeId 解析模板
// 规则：storeId 以 '-retail' 结尾 -> retail-demo，否则 default
export function resolveTemplate(storeId: string | null): TemplateConfig {
  if (storeId && storeId.endsWith('-retail')) {
    return registry.get('retail-demo') || defaultConfig;
  }
  return registry.get('default') || defaultConfig;
}
