// 推送渠道接口
export interface ChannelSendOptions {
  token: string;
  title: string;
  content: string;
  link?: string;
}

export interface ChannelSendResult {
  ok: boolean;
  error?: string;
}

export interface PushChannel {
  readonly key: string;
  send(opts: ChannelSendOptions): Promise<ChannelSendResult>;
}

// 抽象 HTTP 渠道基类 - 注入 fetch 便于测试
export abstract class BaseHttpChannel implements PushChannel {
  abstract readonly key: string;
  protected abstract endpoint(token: string): string;
  protected abstract buildBody(opts: ChannelSendOptions): Record<string, unknown>;

  constructor(protected fetchImpl: typeof globalThis.fetch = globalThis.fetch) {}

  async send(opts: ChannelSendOptions): Promise<ChannelSendResult> {
    try {
      const url = this.endpoint(opts.token);
      const res = await this.fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.buildBody(opts)),
      });
      if (!res.ok) {
        return { ok: false, error: 'HTTP ' + res.status };
      }
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // 非 JSON 响应，视为成功
      }
      // 兼容各渠道的 code 字段（0/200 表示成功）
      if (data && typeof data.code === 'number' && data.code !== 0 && data.code !== 200) {
        return { ok: false, error: data.msg || data.message || '渠道返回错误码 ' + data.code };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || '网络错误' };
    }
  }
}
