import { BaseHttpChannel, type ChannelSendOptions } from './channel.js';

// 爱语飞飞渠道：https://iyuu.cn/push/<token>
export class IyuuChannel extends BaseHttpChannel {
  readonly key = 'iyuu';

  protected endpoint(token: string): string {
    return 'https://iyuu.cn/push/' + encodeURIComponent(token);
  }

  protected buildBody(opts: ChannelSendOptions): Record<string, unknown> {
    return {
      title: opts.title,
      content: opts.link ? opts.content + '\n链接：' + opts.link : opts.content,
    };
  }
}
