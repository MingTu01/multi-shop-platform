import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore, useNotificationStore, type Role } from '@msp/shared';
import { RoleBadge } from '@msp/ui';
import {
  LayoutDashboard,
  Store,
  BarChart3,
  Bell,
  FileText,
  Settings,
  ScrollText,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  key: string;
  badge?: boolean;
  roles: Role[];
}

// 管理端导航项（匹配原项目 adminNav 结构，适配当前路由）
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘', key: 'dashboard', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/stores', icon: Store, label: '店铺管理', key: 'stores', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/reports', icon: BarChart3, label: '报表统计', key: 'reports', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
  { to: '/notifications', icon: Bell, label: '通知中心', key: 'notifications', badge: true, roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/templates', icon: FileText, label: '模板管理', key: 'templates', roles: ['ADMIN'] },
  { to: '/settings/push', icon: Settings, label: '推送设置', key: 'push', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'] },
  { to: '/logs', icon: ScrollText, label: '操作日志', key: 'logs', roles: ['ADMIN', 'STORE_ADMIN', 'MANAGER'] },
];

const MAX_DIRECT = 5; // 移动端底部导航直接显示数量

export function MainLayout({ children }: { children: ReactNode }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [showMore, setShowMore] = useState(false);
  const [hidden, setHidden] = useState(false);

  const items = NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.role) : false));

  // 键盘弹起时隐藏底部导航
  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;
    const handler = () => {
      const keyboardHeight = window.innerHeight - vp.height;
      setHidden(keyboardHeight > 150);
    };
    vp.addEventListener('resize', handler);
    return () => vp.removeEventListener('resize', handler);
  }, []);

  // 路由切换时关闭"更多"面板
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ===== 桌面端侧边栏（固定左侧 256px）=====
  const sidebar = (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl lg:flex">
      {/* Logo 区域 */}
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-800">Multi Shop Link</div>
          <div className="text-xs text-slate-400">多店管理平台</div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ' +
                (isActive
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 用户信息区 */}
      {user && (
        <div className="border-t border-slate-200/60 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-slate-800">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <span className="truncate text-xs text-slate-400">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
              aria-label="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );

  // ===== 移动端底部导航 =====
  const directTabs = items.length <= MAX_DIRECT ? items : items.slice(0, MAX_DIRECT - 1);
  const moreTabs = items.length <= MAX_DIRECT ? [] : items.slice(MAX_DIRECT - 1);

  const renderMobileItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.key}
        to={item.to}
        aria-label={item.label}
        className={({ isActive }) =>
          'flex min-w-[56px] flex-shrink-0 flex-col items-center gap-0.5 px-1 py-2 pt-2.5 text-xs transition-colors ' +
          (isActive ? 'font-semibold text-indigo-600' : 'text-slate-400')
        }
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Icon className="h-5 w-5" />
          {item.badge && unreadCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span className="max-w-[52px] truncate">{item.label}</span>
      </NavLink>
    );
  };

  const bottomNav = (
    <>
      {/* 更多面板 */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 right-2 w-48 rounded-2xl border border-white/40 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 px-3 py-1 text-xs font-semibold text-slate-500">更多功能</div>
            {moreTabs.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  aria-label={item.label}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ' +
                    (isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'text-slate-600 hover:bg-white/60')
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
      <nav
        className={
          'fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl lg:hidden ' +
          (hidden ? 'translate-y-full' : '')
        }
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', transition: 'transform 0.2s' }}
      >
        <div className="flex items-end justify-around">
          {directTabs.map(renderMobileItem)}
          {moreTabs.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              aria-label="更多"
              className="flex min-w-[56px] flex-shrink-0 flex-col items-center gap-0.5 px-1 py-2 pt-2.5 text-xs text-slate-400"
            >
              {showMore ? (
                <X className="h-5 w-5 text-indigo-600" />
              ) : (
                <MoreHorizontal className="h-5 w-5" />
              )}
              <span className="max-w-[52px] truncate">更多</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );

  return (
    <div
      className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-[env(safe-area-inset-top,0px)]"
      data-readonly={user?.role === 'SHAREHOLDER' ? 'true' : undefined}
    >
      {sidebar}
      <main className="overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pl-64 lg:pb-6">
        <div className="mx-auto max-w-5xl px-4 py-4 lg:px-6 lg:py-6">
          <div className="msp-fade-in">{children}</div>
        </div>
      </main>
      {bottomNav}
    </div>
  );
}
