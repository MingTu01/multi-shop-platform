import { useEffect, useState, type CSSProperties } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { PageLayout, Button } from '@msp/ui';
import { useStoreAuth } from './lib/useStoreAuth.js';
import { resolveTemplate, mergeServerConfig, type ServerTemplateConfig } from '../core/template-loader.js';
import { isFeatureEnabled, ROUTE_FEATURE_MAP } from '../core/feature-flags.js';
import { gatewayApi } from './lib/gatewayApi.js';
import { TokenEntryPage } from '../shared-pages/TokenEntryPage.js';
import type { TemplateConfig } from '../core/config-schema.js';

export function App() {
  const { token, storeId, clear } = useStoreAuth();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<TemplateConfig>(() => resolveTemplate(storeId));

  // 已登录后拉取服务端分配的模板配置
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    gatewayApi
      .get('/template')
      .then((res: { template_id: string; name?: string; version?: string; config?: ServerTemplateConfig }) => {
        if (cancelled) return;
        if (res && res.config) {
          setTemplate(mergeServerConfig(res.config));
        }
      })
      .catch(() => {
        // 拉取失败时回退到内置模板
        if (!cancelled) setTemplate(resolveTemplate(storeId));
      });
    return () => {
      cancelled = true;
    };
  }, [token, storeId]);

  // 无 token 时仅暴露登录页
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<TokenEntryPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 按特性开关过滤可见路由
  const visibleRoutes = template.routes.filter((r) => {
    const featureKey = ROUTE_FEATURE_MAP[r.path];
    return !featureKey || isFeatureEnabled(template.features, featureKey);
  });

  const rootRoute = visibleRoutes.find((r) => r.path === '/');
  const firstPath = visibleRoutes[0]?.path || '/login';
  const RootComp = rootRoute?.component;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-4 text-lg font-bold text-slate-800 border-b border-slate-200">
        店铺端
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {visibleRoutes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === '/'}
            className={({ isActive }) =>
              'block px-3 py-2 rounded-md text-sm ' +
              (isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-100')
            }
          >
            {r.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3">
        <div className="mb-2 truncate text-xs text-slate-400">
          {storeId ? '店铺：' + storeId : '未绑定店铺'}
        </div>
        <Button
          variant="text"
          size="sm"
          onClick={() => {
            clear();
            navigate('/login');
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white">
      <span className="text-sm font-medium text-slate-700">{template.name}</span>
      <span className="text-xs text-slate-400">v{template.version}</span>
    </div>
  );

  return (
    <div
      style={{ '--template-primary': template.theme.primary } as CSSProperties}
      className="min-h-screen"
    >
      <PageLayout sidebar={sidebar} header={header}>
        <div className="p-6">
          <Routes>
            <Route
              path="/"
              element={RootComp ? <RootComp /> : <Navigate to={firstPath} replace />}
            />
            {visibleRoutes
              .filter((r) => r.path !== '/')
              .map((r) => {
                const C = r.component;
                return <Route key={r.path} path={r.path} element={<C />} />;
              })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PageLayout>
    </div>
  );
}
