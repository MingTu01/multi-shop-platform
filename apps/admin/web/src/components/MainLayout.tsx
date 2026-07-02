import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '@msp/shared';
import { NotificationBell, RoleBadge, PageLayout } from '@msp/ui';

const NAV_ITEMS = [
  { to: '/dashboard', label: '仪表盘', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/stores', label: '店铺管理', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/reports', label: '报表', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/notifications', label: '通知中心', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/settings/push', label: '推送设置', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/templates', label: '模板管理', roles: ['ADMIN'] },
  { to: '/logs', label: '操作日志', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
];

export function MainLayout({ children }: { children: ReactNode }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.role) : false));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-4 text-lg font-bold text-slate-800 border-b border-slate-200">
        多店管理平台
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'block px-3 py-2 rounded-md text-sm ' +
              (isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-100')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-700 truncate">{user.name}</span>
            <RoleBadge role={user.role} />
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-xs text-slate-500 hover:text-rose-600 text-left"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );

  const header = (
    <div className="flex items-center justify-end px-6 h-14 border-b border-slate-200 bg-white">
      <NotificationBell onClick={() => navigate('/notifications')} />
    </div>
  );

  return (
    <PageLayout sidebar={sidebar} header={header}>
      <div className="p-6">{children}</div>
    </PageLayout>
  );
}
