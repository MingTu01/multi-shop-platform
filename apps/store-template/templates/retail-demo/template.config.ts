// 零售示例模板（差异化主题 + 精简菜单，复用 default 页面）
import { defineTemplateConfig } from '../../core/config-schema.js';
import { EntriesPage } from '../default/pages/EntriesPage.js';
import { InventoryPage } from '../default/pages/InventoryPage.js';
import { ReportsPage } from '../default/pages/ReportsPage.js';
import { NotificationsPage } from '../default/pages/NotificationsPage.js';

export const retailDemoConfig = defineTemplateConfig({
  name: '零售示例',
  version: '0.5.0',
  features: {
    inventory: true,
    shifts: true,
    payroll: true,
    dividends: false,
    reports: true,
    notifications: true,
    pushSettings: true,
  },
  theme: {
    primary: '#0ea5e9',
  },
  routes: [
    { path: '/entries', label: '记账', component: EntriesPage },
    { path: '/inventory', label: '库存', component: InventoryPage },
    { path: '/reports', label: '报表', component: ReportsPage },
    { path: '/notifications', label: '通知', component: NotificationsPage },
  ],
});
