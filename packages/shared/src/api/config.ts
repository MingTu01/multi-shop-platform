// 服务器地址配置
// Web 模式（同源）：返回空字符串（相对路径）
// 原生 App 模式（Capacitor）：返回配置的服务器 URL
// CapacitorHttp 已启用，所有请求原生发送（无 CORS）

export function getBaseURL(): string {
  const isNative = typeof window !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.();

  if (!isNative) {
    return '';
  }

  return localStorage.getItem('msl_server_url') || '';
}

export function setServerURL(url: string) {
  const normalized = url.replace(/\/+$/, '');
  localStorage.setItem('msl_server_url', normalized);
}

export function getServerURL(): string {
  return localStorage.getItem('msl_server_url') || '';
}

export function clearServerURL() {
  localStorage.removeItem('msl_server_url');
}

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.();
}
