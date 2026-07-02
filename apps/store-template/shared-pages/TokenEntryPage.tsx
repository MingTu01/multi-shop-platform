// 店铺端 Token 输入页（store-token 鉴权入口）
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setServerURL } from '@msp/shared';
import { Card, Button, Input } from '@msp/ui';
import { useStoreAuth } from '../src/lib/useStoreAuth.js';

export function TokenEntryPage() {
  const navigate = useNavigate();
  const setToken = useStoreAuth().setToken;
  const [token, setTokenInput] = useState('');
  const [serverURL, setServerURLInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const t = token.trim();
    if (!t) {
      setError('请输入店铺 Token');
      return;
    }
    setToken(t);
    if (serverURL.trim()) setServerURL(serverURL.trim());
    navigate('/');
  };

  // 演示模式：预填假 Token（同源访问，服务器地址留空走代理）
  const handleDemo = () => {
    setTokenInput('msp_demo_xxx');
    setServerURLInput('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">店铺端登录</h1>
        <Card title="店铺 Token">
          <div className="space-y-3">
            <Input
              value={token}
              onChange={setTokenInput}
              placeholder="msp_<storeId>_<rand>"
              label="店铺 Token"
            />
            <Input
              value={serverURL}
              onChange={setServerURLInput}
              placeholder="留空则同源（开发模式走代理）"
              label="服务器地址（可选）"
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <Button className="w-full" onClick={handleSubmit}>进入店铺</Button>
            <Button variant="text" className="w-full" onClick={handleDemo}>演示模式</Button>
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-400">
          Token 由管理端为店铺生成，格式：msp_&lt;storeId&gt;_&lt;rand&gt;
        </p>
      </div>
    </div>
  );
}
