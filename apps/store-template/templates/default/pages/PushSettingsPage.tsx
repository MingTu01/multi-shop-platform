// 推送设置页（复用 @msp/shared PUSH_TYPE_CONFIGS / CATEGORY_COLORS 与 @msp/ui PushTypeSwitch）
// 网关仅提供 PUT /push/settings?userId=N，无读取接口，故按默认值初始化
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gatewayApi } from '../../../src/lib/gatewayApi.js';
import { Card, Button, Input } from '@msp/ui';
import { PushTypeSwitch } from '@msp/ui';
import { PUSH_TYPE_CONFIGS } from '@msp/shared';

export function PushSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId') || '';
  const [userId, setUserId] = useState(userIdParam);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // 按默认配置初始化各推送字段开关
  const initial = useMemo(() => {
    const v: Record<string, boolean> = {};
    for (const c of PUSH_TYPE_CONFIGS) v[c.key] = c.defaultSelected;
    return v;
  }, []);
  const [settings, setSettings] = useState<Record<string, boolean>>(initial);

  const handleQuery = () => {
    setSearchParams(userId ? { userId } : {});
  };

  const handleSave = async () => {
    if (!userIdParam) {
      setMsg('请先输入用户 ID');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await gatewayApi.put(`/push/settings?userId=${userIdParam}`, settings);
      setMsg('保存成功');
    } catch (e: any) {
      setMsg(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">推送设置</h1>

      <Card title="用户" className="mb-4">
        <div className="flex gap-2 items-end">
          <div className="w-48">
            <Input type="number" value={userId} onChange={setUserId} placeholder="用户 ID" />
          </div>
          <button
            type="button"
            onClick={handleQuery}
            className="h-9 px-4 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            选择用户
          </button>
        </div>
        {userIdParam && <p className="mt-2 text-xs text-slate-400">当前用户 ID：{userIdParam}</p>}
      </Card>

      <Card title="推送类型" className="mb-4">
        <PushTypeSwitch value={settings} onChange={setSettings} />
      </Card>

      <div className="flex justify-end items-center gap-3">
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
        <Button onClick={handleSave} loading={saving}>保存设置</Button>
      </div>
    </div>
  );
}
