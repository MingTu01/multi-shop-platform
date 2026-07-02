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

// 服务端模板配置（不含组件引用，仅元数据）
export interface ServerTemplateConfig {
  name: string;
  version: string;
  features: TemplateConfig['features'];
  theme: TemplateConfig['theme'];
  routes: { path: string; label: string }[];
}

// 将服务端配置与内置组件合并，生成可渲染的 TemplateConfig
// 服务端 routes 的 path 用于匹配内置组件；未匹配的路由将被忽略
export function mergeServerConfig(server: ServerTemplateConfig): TemplateConfig {
  const fallback = resolveTemplate(null);
  // path -> 组件 映射（取 default 模板的内置组件）
  const componentMap = new Map<string, any>();
  for (const r of fallback.routes) {
    componentMap.set(r.path, r.component);
  }
  const mergedRoutes = server.routes
    .map((r) => ({
      path: r.path,
      label: r.label,
      component: componentMap.get(r.path),
    }))
    .filter((r) => r.component); // 仅保留有对应组件的路由

  return defineTemplateConfig({
    name: server.name || fallback.name,
    version: server.version || fallback.version,
    features: server.features || fallback.features,
    theme: server.theme || fallback.theme,
    routes: mergedRoutes.length > 0 ? mergedRoutes : fallback.routes,
  });
}
