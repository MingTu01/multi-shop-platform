// 店铺端网关 API 客户端（store-token 鉴权，非 cookie）
// 复用 @msp/shared 的 getServerURL 读取服务器地址
import { getServerURL } from '@msp/shared';

const TOKEN_KEY = 'msp_store_token';

function getToken(): string {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

function baseURL(): string {
  return getServerURL();
}

async function request(method: string, url: string, body?: unknown): Promise<any> {
  const res = await fetch(baseURL() + '/api/gateway/v1' + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken(),
    },
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let msg = '请求失败 (' + res.status + ')';
    try {
      const data = await res.json();
      msg = data.error || data.message || msg;
    } catch {
      // 非 JSON 响应，使用默认错误信息
    }
    throw new Error(msg);
  }
  return res.json();
}

export const gatewayApi = {
  get: (url: string) => request('GET', url),
  post: (url: string, body: unknown) => request('POST', url, body),
  put: (url: string, body: unknown) => request('PUT', url, body),
};
