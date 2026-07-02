import { BaseHttpChannel, type ChannelSendOptions } from './channel.js';

// 企业微信渠道：https://qyapi.weixin.qq.com/cgi-bin/message/send
// 注：token 这里直接作为 access_token 使用（宿主应预先换取）
export class WecomChannel extends BaseHttpChannel {
  readonly key = 'wecom';
  private agentId: number;

  constructor(agentId = 1000002, fetchImpl?: typeof globalThis.fetch) {
    super(fetchImpl);
    this.agentId = agentId;
  }

  protected endpoint(token: string): string {
    return 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + encodeURIComponent(token);
  }

  protected buildBody(opts: ChannelSendOptions): Record<string, unknown> {
    const text = opts.link ? opts.title + '\n' + opts.content + '\n链接：' + opts.link : opts.title + '\n' + opts.content;
    return {
      touser: '@all',
      msgtype: 'text',
      agentid: this.agentId,
      text: { content: text },
    };
  }
}
