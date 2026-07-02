// 模板注册表：支持运行时覆盖默认模板
import type { NotifyType } from '@msp/shared';
import type { TemplateFn } from '../types.js';
import { DEFAULT_TEMPLATES, getTemplate as getDefault } from './default-templates.js';

const customTemplates = new Map<NotifyType, TemplateFn>();

export function getTemplate(type: NotifyType): TemplateFn {
  return customTemplates.get(type) || getDefault(type);
}

export function registerTemplate(type: NotifyType, fn: TemplateFn): void {
  customTemplates.set(type, fn);
}

export function clearCustomTemplates(): void {
  customTemplates.clear();
}

export { DEFAULT_TEMPLATES };
