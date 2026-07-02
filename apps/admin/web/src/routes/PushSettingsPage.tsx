import { useEffect, useState } from 'react';
import { api } from '@msp/shared';
import { PUSH_TYPE_CONFIGS, CATEGORY_COLORS } from '@msp/shared';
import { Card, Button } from '@msp/ui';
import type { PushCategory } from '@msp/shared';

export function PushSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokens, setTokens] = useState({ pushplus_token: '', wecom_secret: '', iyuu_token: '' });

  useEffect(() => {
    api.get('/push/settings').then((d) => {
      setSettings(d);
      setTokens({
        pushplus_token: d.pushplus_token || '',
        wecom_secret: d.wecom_secret || '',
        iyuu_token: d.iyuu_token || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/push/settings', { ...settings, ...tokens });
    } finally {
      setSaving(false);
    }
  };

  const categories: PushCategory[] = ['经营报表', '异常审核', '门店运营', '人事财务'];

  if (loading) return <p className="text-slate-400">加载中...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">推送设置</h1>

      <Card title="渠道 Token" className="mb-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">PushPlus Token</label>
            <input className="w-full border rounded px-2 py-1 text-sm mt-1" value={tokens.pushplus_token} onChange={(e) => setTokens({ ...tokens, pushplus_token: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">企业微信 Secret</label>
            <input className="w-full border rounded px-2 py-1 text-sm mt-1" value={tokens.wecom_secret} onChange={(e) => setTokens({ ...tokens, wecom_secret: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-slate-600">爱语飞飞 Token</label>
            <input className="w-full border rounded px-2 py-1 text-sm mt-1" value={tokens.iyuu_token} onChange={(e) => setTokens({ ...tokens, iyuu_token: e.target.value })} />
          </div>
        </div>
      </Card>

      {categories.map((cat) => {
        const items = PUSH_TYPE_CONFIGS.filter((c) => c.category === cat);
        const colors = CATEGORY_COLORS[cat];
        return (
          <Card key={cat} title={<span className={colors.text}>{cat}</span>} className="mb-4">
            <div className="space-y-2">
              {items.map((c) => (
                <div key={c.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm text-slate-700">{c.label}</p>
                    <p className="text-xs text-slate-400">{c.title}</p>
                  </div>
                  <button
                    onClick={() => toggle(c.key)}
                    className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (settings[c.key] ? 'bg-emerald-500' : 'bg-slate-300')}
                  >
                    <span className={'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' + (settings[c.key] ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>保存设置</Button>
      </div>
    </div>
  );
}
