import { isIPv4, isIPv6 } from 'net';
import { resolve4, resolve6 } from 'dns';
import { promisify } from 'util';

const resolve4Async = promisify(resolve4);
const resolve6Async = promisify(resolve6);

/**
 * 检查 IP 地址是否为内网/私有地址（SSRF 防护）
 */
export function isPrivateIp(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '');

  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0:0:0:0:0:0:0:1') {
    return true;
  }

  if (isIPv4(host)) {
    const parts = host.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 127) return true;
    return false;
  }

  if (isIPv6(host)) {
    const lower = host.toLowerCase();
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.startsWith('fe80')) return true;
    if (lower === '::1') return true;
    return false;
  }

  return false;
}

/**
 * 校验 webhook URL 安全性（同步字面量校验）
 */
export function validateWebhookUrl(urlStr: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: '仅支持 http/https 协议' };
    }
    if (isPrivateIp(url.hostname)) {
      return { valid: false, error: '禁止访问内网地址' };
    }
    const blockedHosts = ['169.254.169.254', 'metadata.google.internal', 'metadata.google.com'];
    if (blockedHosts.includes(url.hostname)) {
      return { valid: false, error: '禁止访问云服务元数据地址' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL 格式无效' };
  }
}

/**
 * 校验 webhook URL 安全性（异步版本，含 DNS 解析校验）
 */
export async function validateWebhookUrlAsync(urlStr: string): Promise<{ valid: boolean; error?: string }> {
  const sync = validateWebhookUrl(urlStr);
  if (!sync.valid) return sync;

  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    if (!isIPv4(hostname) && !isIPv6(hostname) && hostname !== 'localhost') {
      try {
        const ips = await resolve4Async(hostname);
        for (const ip of ips) {
          if (isPrivateIp(ip)) return { valid: false, error: '域名解析到内网地址' };
        }
      } catch { /* IPv4 解析失败，尝试 IPv6 */ }
      try {
        const ips6 = await resolve6Async(hostname);
        for (const ip of ips6) {
          if (isPrivateIp(ip)) return { valid: false, error: '域名解析到内网地址' };
        }
      } catch { /* IPv6 也解析失败，可能是本地域名，允许通过 */ }
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL 格式无效' };
  }
}
