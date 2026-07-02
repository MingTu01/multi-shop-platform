import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore, useUnreadPolling } from '@msp/shared';
import { LoginPage } from './routes/LoginPage.js';
import { MainLayout } from './components/MainLayout.js';
import { DashboardPage } from './routes/DashboardPage.js';
import { StoresPage } from './routes/StoresPage.js';
import { EntriesPage } from './routes/EntriesPage.js';
import { InventoryPage } from './routes/InventoryPage.js';
import { ShiftsPage } from './routes/ShiftsPage.js';
import { PayrollPage } from './routes/PayrollPage.js';
import { DividendsPage } from './routes/DividendsPage.js';
import { StaffPage } from './routes/StaffPage.js';
import { ReportsPage } from './routes/ReportsPage.js';
import { NotificationsPage } from './routes/NotificationsPage.js';
import { PushSettingsPage } from './routes/PushSettingsPage.js';
import { LogsPage } from './routes/LogsPage.js';
import { TemplatesPage } from './routes/TemplatesPage.js';

export function App() {
  const user = useStore((s) => s.user);
  const loading = useStore((s) => s.loading);
  const restore = useStore((s) => s.restore);

  // 首次挂载恢复登录态
  useEffect(() => {
    void restore();
  }, [restore]);

  // 已登录时启动未读轮询
  useUnreadPolling();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">加载中...</div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId/entries" element={<EntriesPage />} />
        <Route path="/stores/:storeId/inventory" element={<InventoryPage />} />
        <Route path="/stores/:storeId/shifts" element={<ShiftsPage />} />
        <Route path="/stores/:storeId/payroll" element={<PayrollPage />} />
        <Route path="/stores/:storeId/dividends" element={<DividendsPage />} />
        <Route path="/stores/:storeId/staff" element={<StaffPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings/push" element={<PushSettingsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}
