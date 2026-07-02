// 通用模板配置
import { defineTemplateConfig } from '../../core/config-schema.js';
import { StoreInfoPage } from './pages/StoreInfoPage.js';
import { EntriesPage } from './pages/EntriesPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { ShiftsPage } from './pages/ShiftsPage.js';
import { PayrollPage } from './pages/PayrollPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { PushSettingsPage } from './pages/PushSettingsPage.js';

export const defaultConfig = defineTemplateConfig({
  name: '通用模板',
  version: '0.5.0',
  features: {
    inventory: true,
    shifts: true,
    payroll: true,
    dividends: true,
    reports: true,
    notifications: true,
    pushSettings: true,
  },
  theme: {
    primary: '#16a34a',
  },
  routes: [
    { path: '/', label: '本店信息', component: StoreInfoPage },
    { path: '/entries', label: '记账', component: EntriesPage },
    { path: '/inventory', label: '库存', component: InventoryPage },
    { path: '/shifts', label: '排班', component: ShiftsPage },
    { path: '/payroll', label: '工资', component: PayrollPage },
    { path: '/reports', label: '报表', component: ReportsPage },
    { path: '/notifications', label: '通知', component: NotificationsPage },
    { path: '/push-settings', label: '推送设置', component: PushSettingsPage },
  ],
});
