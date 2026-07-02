import { BaseHttpChannel, type ChannelSendOptions } from './channel.js';

// PushPlus 渠道：https://www.pushplus.plus/send
export class PushPlusChannel extends BaseHttpChannel {
  readonly key = 'pushplus';

  protected endpoint(_token: string): string {
    return 'https://www.pushplus.plus/send';
  }

  protected buildBody(opts: ChannelSendOptions): Record<string, unknown> {
    const content = opts.link ? opts.content + '\n链接：' + opts.link : opts.content;
    return {
      token: opts.token,
      title: opts.title,
      content,
      template: 'txt',
    };
  }
}
