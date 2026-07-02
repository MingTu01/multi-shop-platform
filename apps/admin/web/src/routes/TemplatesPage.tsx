import { useState, useRef } from 'react';
import { useApi } from '../hooks/useApi.js';
import { api } from '@msp/shared';
import { Card, Button, Table, Badge, Modal, Input } from '@msp/ui';
import type { StoreInfo } from '@msp/shared';

interface TemplateRoute {
  path: string;
  label: string;
}
interface TemplateFeatures {
  inventory: boolean;
  shifts: boolean;
  payroll: boolean;
  dividends: boolean;
  reports: boolean;
  notifications: boolean;
  pushSettings: boolean;
}
interface TemplateConfig {
  name: string;
  version: string;
  features: TemplateFeatures;
  theme: { primary: string };
  routes: TemplateRoute[];
}
interface Template {
  id: string;
  name: string;
  version: string;
  description: string | null;
  source: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
  config: TemplateConfig;
}

const SOURCE_LABELS: Record<string, { text: string; color: string }> = {
  builtin: { text: '内置', color: 'bg-blue-50 text-blue-700' },
  manual: { text: '手动', color: 'bg-slate-100 text-slate-700' },
  import: { text: '导入', color: 'bg-emerald-50 text-emerald-700' },
  online: { text: '在线', color: 'bg-purple-50 text-purple-700' },
};

const FEATURE_KEYS: { key: keyof TemplateFeatures; label: string }[] = [
  { key: 'inventory', label: '库存' },
  { key: 'shifts', label: '排班' },
  { key: 'payroll', label: '工资' },
  { key: 'dividends', label: '分红' },
  { key: 'reports', label: '报表' },
  { key: 'notifications', label: '通知' },
  { key: 'pushSettings', label: '推送设置' },
];

function emptyConfig(): TemplateConfig {
  return {
    name: '',
    version: '0.5.0',
    features: { inventory: true, shifts: true, payroll: true, dividends: true, reports: true, notifications: true, pushSettings: true },
    theme: { primary: '#16a34a' },
    routes: [{ path: '/', label: '本店信息' }],
  };
}

export function TemplatesPage() {
  const { data, loading, reload } = useApi<Template[]>('/templates');
  const { data: stores } = useApi<StoreInfo[]>('/stores');
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<TemplateConfig>(emptyConfig());
  const [draftDesc, setDraftDesc] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [showImportUrl, setShowImportUrl] = useState(false);
  const [assigning, setAssigning] = useState<Template | null>(null);
  const [assignStore, setAssignStore] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setDraft(emptyConfig());
    setDraftDesc('');
    setCreating(true);
    setError('');
  };

  const openEdit = (tpl: Template) => {
    setDraft(JSON.parse(JSON.stringify(tpl.config)));
    setDraftDesc(tpl.description || '');
    setEditing(tpl);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!draft.name.trim()) {
      setError('模板名称必填');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await api.put(`/templates/${editing.id}`, { config: draft, description: draftDesc });
      } else {
        await api.post('/templates', { config: draft, description: draftDesc });
      }
      setEditing(null);
      setCreating(false);
      reload();
    } catch (e: any) {
      setError(e?.message || '保存失败');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (tpl: Template) => {
    if (!confirm(`确认删除模板「${tpl.name}」？`)) return;
    try {
      await api.del(`/templates/${tpl.id}`);
      reload();
    } catch (e: any) {
      alert(e?.message || '删除失败');
    }
  };

  const handleExport = async (tpl: Template) => {
    try {
      const res = await api.get(`/templates/${tpl.id}/export`);
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tpl.id}-${tpl.version}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || '导出失败');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await api.post('/templates/import', payload);
      reload();
    } catch (err: any) {
      alert(err?.message || '导入失败');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setError('');
    setBusy(true);
    try {
      await api.post('/templates/import-url', { url: importUrl });
      setImportUrl('');
      setShowImportUrl(false);
      reload();
    } catch (e: any) {
      setError(e?.message || '在线导入失败');
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!assigning || !assignStore) return;
    setBusy(true);
    try {
      await api.post(`/templates/${assigning.id}/assign`, { storeId: assignStore });
      setAssigning(null);
      setAssignStore('');
      reload();
    } catch (e: any) {
      setError(e?.message || '分配失败');
    } finally {
      setBusy(false);
    }
  };

  const addRoute = () => {
    setDraft({ ...draft, routes: [...draft.routes, { path: '/new', label: '新页面' }] });
  };
  const updateRoute = (i: number, field: 'path' | 'label', val: string) => {
    const routes = draft.routes.map((r, idx) => (idx === i ? { ...r, [field]: val } : r));
    setDraft({ ...draft, routes });
  };
  const removeRoute = (i: number) => {
    setDraft({ ...draft, routes: draft.routes.filter((_, idx) => idx !== i) });
  };
  const toggleFeature = (key: keyof TemplateFeatures) => {
    setDraft({ ...draft, features: { ...draft.features, [key]: !draft.features[key] } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">模板管理</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>导入文件</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowImportUrl(true)}>在线导入</Button>
          <Button size="sm" onClick={openCreate}>新建模板</Button>
        </div>
      </div>

      <Card>
        <Table<Template>
          loading={loading}
          rowKey={(r) => r.id}
          data={data || []}
          empty={<div className="text-center py-8 text-slate-400">暂无模板</div>}
          columns={[
            { key: 'name', title: '模板名称', render: (r) => (
              <div>
                <div className="font-medium text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-400">{r.id}</div>
              </div>
            ) },
            { key: 'version', title: '版本' },
            { key: 'source', title: '来源', render: (r) => {
              const s = SOURCE_LABELS[r.source] || { text: r.source, color: 'bg-slate-100 text-slate-700' };
              return <Badge color={s.color}>{s.text}</Badge>;
            } },
            { key: 'features', title: '特性', render: (r) => (
              <div className="flex flex-wrap gap-1">
                {FEATURE_KEYS.filter((f) => r.config.features[f.key]).map((f) => (
                  <span key={f.key} className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{f.label}</span>
                ))}
              </div>
            ) },
            { key: 'theme', title: '主题', render: (r) => (
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded border border-slate-200" style={{ background: r.config.theme.primary }} />
                <span className="text-xs text-slate-500">{r.config.theme.primary}</span>
              </div>
            ) },
            { key: 'actions', title: '操作', render: (r) => (
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="text" onClick={() => openEdit(r)}>编辑</Button>
                <Button size="sm" variant="text" onClick={() => handleExport(r)}>导出</Button>
                <Button size="sm" variant="text" onClick={() => { setAssigning(r); setAssignStore(''); }}>分配</Button>
                {r.source !== 'builtin' && (
                  <Button size="sm" variant="text" className="text-rose-600" onClick={() => handleDelete(r)}>删除</Button>
                )}
              </div>
            ) },
          ]}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? '编辑模板' : '新建模板'}
        size="lg"
        footer={
          <>
            {error && <span className="text-xs text-rose-600 mr-auto">{error}</span>}
            <Button size="sm" variant="text" onClick={() => { setCreating(false); setEditing(null); }}>取消</Button>
            <Button size="sm" loading={busy} onClick={handleSave}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="模板名称" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="如：通用模板" />
            <Input label="版本" value={draft.version} onChange={(v) => setDraft({ ...draft, version: v })} />
          </div>
          <div>
            <Input label="描述" value={draftDesc} onChange={setDraftDesc} placeholder="模板说明" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">主题色</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={draft.theme.primary} onChange={(e) => setDraft({ ...draft, theme: { primary: e.target.value } })} className="w-10 h-8 rounded border border-slate-300" />
              <input className="border rounded px-2 py-1 text-sm" value={draft.theme.primary} onChange={(e) => setDraft({ ...draft, theme: { primary: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">特性开关</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {FEATURE_KEYS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFeature(f.key)}
                  className={'text-xs px-2 py-1 rounded border transition-colors ' + (draft.features[f.key] ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400')}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">路由菜单</label>
              <Button size="sm" variant="text" onClick={addRoute}>+ 添加</Button>
            </div>
            <div className="space-y-2 mt-1">
              {draft.routes.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="border rounded px-2 py-1 text-sm w-32" value={r.path} onChange={(e) => updateRoute(i, 'path', e.target.value)} placeholder="/path" />
                  <input className="border rounded px-2 py-1 text-sm flex-1" value={r.label} onChange={(e) => updateRoute(i, 'label', e.target.value)} placeholder="菜单名" />
                  <Button size="sm" variant="text" className="text-rose-600" onClick={() => removeRoute(i)}>删除</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 在线导入弹窗 */}
      <Modal
        open={showImportUrl}
        onClose={() => setShowImportUrl(false)}
        title="在线导入模板"
        footer={
          <>
            {error && <span className="text-xs text-rose-600 mr-auto">{error}</span>}
            <Button size="sm" variant="text" onClick={() => setShowImportUrl(false)}>取消</Button>
            <Button size="sm" loading={busy} onClick={handleImportUrl}>导入</Button>
          </>
        }
      >
        <p className="text-xs text-slate-500 mb-3">输入模板 JSON 的 URL，系统将拉取并校验后导入。</p>
        <Input label="模板 URL" value={importUrl} onChange={setImportUrl} placeholder="https://example.com/template.json" />
      </Modal>

      {/* 分配弹窗 */}
      <Modal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={`分配模板：${assigning?.name || ''}`}
        footer={
          <>
            {error && <span className="text-xs text-rose-600 mr-auto">{error}</span>}
            <Button size="sm" variant="text" onClick={() => setAssigning(null)}>取消</Button>
            <Button size="sm" loading={busy} onClick={handleAssign}>分配</Button>
          </>
        }
      >
        <p className="text-xs text-slate-500 mb-3">选择要应用该模板的店铺。</p>
        <select
          className="w-full border rounded px-2 py-1 text-sm"
          value={assignStore}
          onChange={(e) => setAssignStore(e.target.value)}
        >
          <option value="">请选择店铺</option>
          {(stores || []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}（{s.id}）</option>
          ))}
        </select>
      </Modal>
    </div>
  );
}
