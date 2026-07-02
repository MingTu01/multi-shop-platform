// 模板配置 zod schema 校验
import { z } from 'zod';

export const TemplateConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  features: z.object({
    inventory: z.boolean().default(true),
    shifts: z.boolean().default(true),
    payroll: z.boolean().default(true),
    dividends: z.boolean().default(true),
    reports: z.boolean().default(true),
    notifications: z.boolean().default(true),
    pushSettings: z.boolean().default(true),
  }).default({}),
  theme: z.object({
    primary: z.string().default('#16a34a'),
  }).default({}),
  routes: z.array(z.object({
    path: z.string(),
    label: z.string(),
    component: z.any(), // React 组件引用
  })).default([]),
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

// 校验并应用默认值
export function defineTemplateConfig(config: unknown): TemplateConfig {
  return TemplateConfigSchema.parse(config);
}
