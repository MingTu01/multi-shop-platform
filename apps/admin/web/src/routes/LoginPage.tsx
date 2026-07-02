import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, resetRedirectFlag } from '@msp/shared';
import { Button, Input } from '@msp/ui';

export function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    resetRedirectFlag();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-1">多店管理平台</h1>
        <p className="text-sm text-slate-500 mb-6">管理端登录</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="用户名" value={username} onChange={setUsername} placeholder="请输入用户名" />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="请输入密码"
            error={error || undefined}
          />
          <Button type="submit" loading={loading} className="w-full">
            登录
          </Button>
        </form>
        <p className="text-xs text-slate-400 mt-4 text-center">默认管理员：admin / admin123</p>
      </div>
    </div>
  );
}
