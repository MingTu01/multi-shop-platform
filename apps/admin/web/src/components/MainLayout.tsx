import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '@msp/shared';
import { RoleBadge, Logo, IconChart, IconStore, IconReport, IconBell, IconSend, IconTemplate, IconLog, IconLogout } from '@msp/ui';

const NAV_ITEMS = [
  { to: '/dashboard', label: '仪表盘', icon: IconChart, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/stores', label: '店铺管理', icon: IconStore, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/reports', label: '报表统计', icon: IconReport, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/notifications', label: '通知中心', icon: IconBell, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/settings/push', label: '推送设置', icon: IconSend, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/templates', label: '模板管理', icon: IconTemplate, roles: ['ADMIN'] },
  { to: '/logs', label: '操作日志', icon: IconLog, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
];

export function MainLayout({ children }: { children: ReactNode }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.role) : false));

  const sidebar = (
    <aside
      className="flex h-full flex-col bg-[var(--msp-surface)] border-r border-[var(--msp-border)]"
      style={{ width: 'var(--msp-sidebar-width)' }}
    >
      {/* Logo 区域 */}
      <div className="msp-logo-icon">
        <Logo size={28} showText />
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'msp-nav-item msp-slide-in ' +
                (isActive ? 'active' : '') +
                ` animation-delay: ${index * 50}ms`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon size={18} className="msp-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* 用户信息区域 */}
      {user && (
        <div className="msp-user-card">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--msp-text)] truncate">
                {user.name}
              </span>
              <RoleBadge role={user.role} />
            </div>
            <span className="text-xs text-[var(--msp-text-weak)] truncate">
              {user.username}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-md text-[var(--msp-text-muted)] hover:bg-[var(--msp-danger-light)] hover:text-[var(--msp-danger)] transition-colors"
            aria-label="退出登录"
          >
            <IconLogout size={18} />
          </button>
        </div>
      )}
    </aside>
  );

  const header = (
    <header
      className="flex items-center justify-end px-6 border-b border-[var(--msp-border)] bg-[var(--msp-surface)]"
      style={{ height: 'var(--msp-header-height)' }}
    >
      {/* 顶部右侧操作区 */}
      <div className="flex items-center gap-4">
        {/* 通知铃铛 */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 rounded-md text-[var(--msp-text-muted)] hover:bg-[var(--msp-primary-light)] hover:text-[var(--msp-primary)] transition-colors relative"
          aria-label="通知"
        >
          <IconBell size={20} />
        </button>
      </div>
    </header>
  );

  return (
    <div className="flex h-full bg-[var(--msp-bg)]">
      {sidebar}
      <main className="flex-1 flex flex-col overflow-hidden">
        {header}
        <div className="flex-1 p-6 overflow-auto">
          <div className="msp-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}