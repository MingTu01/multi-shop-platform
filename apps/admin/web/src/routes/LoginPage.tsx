import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@msp/shared';
import { Logo, IconUser, IconLock, IconSpinner } from '@msp/ui';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] via-[#d1fae5] to-[#a7f3d0] relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute -top-20 -right-20 w-[600px] h-[600px]" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#grad1)" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
        </svg>
        <svg className="absolute -bottom-20 -left-20 w-[400px] h-[400px]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#10b981" opacity="0.05" />
        </svg>
      </div>

      {/* 登录卡片 */}
      <div className="msp-card msp-scale-in w-full max-w-md relative z-10 shadow-[0_8px_30px_rgb(16_185_129/0.12)]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size={36} showText />
        </div>

        {/* 标题 */}
        <h1 className="text-center text-xl font-semibold text-[var(--msp-text)] mb-8">
          欢迎回来
        </h1>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 用户名 */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--msp-text-muted)]">
              <IconUser size={18} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="msp-input pl-12"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          {/* 密码 */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--msp-text-muted)]">
              <IconLock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="msp-input pl-12"
              autoComplete="current-password"
              required
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="msp-badge-danger msp-fade-in">
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="msp-btn msp-btn-primary w-full"
          >
            {loading ? (
              <IconSpinner size={18} className="animate-spin" />
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-sm text-[var(--msp-text-weak)]">
          <p>测试账号：admin / admin123</p>
        </div>
      </div>
    </div>
  );
}