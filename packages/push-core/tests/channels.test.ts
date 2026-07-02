import { describe, it, expect, vi } from 'vitest';
import { PushPlusChannel, WecomChannel, IyuuChannel } from '../src/channels/index.js';
import { assertSafeUrl } from '../src/security/url-guard.js';

function mockFetch(): {
  impl: typeof fetch;
  calls: { url: string; body: any }[];
} {
  const calls: { url: string; body: any }[] = [];
  const impl = (async (url: any, init: any) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
    return new Response(JSON.stringify({ code: 200 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('PushPlusChannel', () => {
  it('POST 到 pushplus 且 body 含 token/title/content', async () => {
    const { impl, calls } = mockFetch();
    const ch = new PushPlusChannel(impl);
    const res = await ch.send({ token: 'T', title: '标题', content: '内容', link: 'http://x' });
    expect(res.ok).toBe(true);
    expect(calls[0].url).toBe('https://www.pushplus.plus/send');
    expect(calls[0].body.token).toBe('T');
    expect(calls[0].body.title).toBe('标题');
    expect(calls[0].body.content).toContain('链接：http://x');
  });
});

describe('WecomChannel', () => {
  it('POST 到企业微信且 body 含 touser/agentid/text', async () => {
    const { impl, calls } = mockFetch();
    const ch = new WecomChannel(1000002, impl);
    const res = await ch.send({ token: 'ACCESS', title: '标题', content: '内容' });
    expect(res.ok).toBe(true);
    expect(calls[0].url).toContain('qyapi.weixin.qq.com');
    expect(calls[0].url).toContain('access_token=ACCESS');
    expect(calls[0].body.touser).toBe('@all');
    expect(calls[0].body.text.content).toContain('标题');
  });
});

describe('IyuuChannel', () => {
  it('POST 到 iyuu 且 url 含 token', async () => {
    const { impl, calls } = mockFetch();
    const ch = new IyuuChannel(impl);
    const res = await ch.send({ token: 'IYUU', title: '标题', content: '内容' });
    expect(res.ok).toBe(true);
    expect(calls[0].url).toBe('https://iyuu.cn/push/IYUU');
    expect(calls[0].body.title).toBe('标题');
  });

  it('HTTP 错误返回 ok=false', async () => {
    const impl = (async () => new Response('', { status: 500 })) as unknown as typeof fetch;
    const ch = new IyuuChannel(impl);
    const res = await ch.send({ token: 't', title: 'x', content: 'y' });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('500');
  });
});

describe('assertSafeUrl (SSRF)', () => {
  it('拒绝内网地址', async () => {
    await expect(assertSafeUrl('http://127.0.0.1/x')).rejects.toThrow();
    await expect(assertSafeUrl('http://10.0.0.1/x')).rejects.toThrow();
    await expect(assertSafeUrl('http://192.168.1.1/x')).rejects.toThrow();
  });

  it('拒绝非 http 协议', async () => {
    await expect(assertSafeUrl('ftp://example.com/x')).rejects.toThrow();
  });

  it('拒绝云元数据地址', async () => {
    await expect(assertSafeUrl('http://169.254.169.254/latest/meta-data')).rejects.toThrow();
  });
});
