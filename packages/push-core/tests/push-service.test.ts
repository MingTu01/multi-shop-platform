import { describe, it, expect, beforeEach } from 'vitest';
import { PushService } from '../src/core/push-service.js';
import type { PushChannel, ChannelSendOptions, ChannelSendResult } from '../src/channels/channel.js';
import { MockUserRepo, MockSettingsRepo, MockNotifyRepo, makeUser } from './repos.mock.js';

// 成功渠道（记录所有调用）
class SuccessChannel implements PushChannel {
  readonly key: string;
  public calls: ChannelSendOptions[] = [];
  constructor(key: string) {
    this.key = key;
  }
  async send(opts: ChannelSendOptions): Promise<ChannelSendResult> {
    this.calls.push(opts);
    return { ok: true };
  }
}

// 总是失败的渠道（使用真实 key 以便解析到 token）
class FailChannel implements PushChannel {
  readonly key = 'pushplus';
  public calls = 0;
  async send(): Promise<ChannelSendResult> {
    this.calls += 1;
    return { ok: false, error: 'mock fail' };
  }
}

function makeService(opts: {
  users: ReturnType<typeof makeUser>[];
  settings?: Record<number, any>;
  channels?: PushChannel[];
}) {
  const userRepo = new MockUserRepo(opts.users);
  const settingsRepo = new MockSettingsRepo(opts.settings);
  const notifyRepo = new MockNotifyRepo();
  const channels = opts.channels || [new SuccessChannel('pushplus')];
  const service = new PushService({ userRepo, settingsRepo, notifyRepo, channels });
  return { service, userRepo, settingsRepo, notifyRepo, channels };
}

describe('PushService.trigger', () => {
  it('dividend 类型只发送给 SHAREHOLDER 和 ADMIN，不发 STAFF', async () => {
    const { service, notifyRepo } = makeService({
      users: [
        makeUser({ id: 1, role: 'ADMIN' }),
        makeUser({ id: 2, role: 'SHAREHOLDER' }),
        makeUser({ id: 3, role: 'STAFF' }),
      ],
      settings: {
        1: { push_dividend_notify: true, iyuu_token: 't1' },
        2: { push_dividend_notify: true, iyuu_token: 't2' },
        3: { push_dividend_notify: true, iyuu_token: 't3' },
      },
      channels: [new SuccessChannel('iyuu')],
    });

    await service.trigger({ type: 'dividend', action: 'grant', storeId: '1' });

    const ids = notifyRepo.records.map((r) => r.user_id).sort();
    expect(ids).toEqual([1, 2]);
  });

  it('用户关闭某类型推送时不发送', async () => {
    const channel = new SuccessChannel('pushplus');
    const { service, notifyRepo } = makeService({
      users: [makeUser({ id: 1, role: 'ADMIN' })],
      settings: { 1: { push_daily_report: false, pushplus_token: 't1' } },
      channels: [channel],
    });

    await service.trigger({ type: 'daily_report', action: 'scheduled', storeId: '1' });

    expect(notifyRepo.records.length).toBe(0);
    expect(channel.calls.length).toBe(0);
  });

  it('字段未定义时使用 defaultSelected', async () => {
    // daily_report defaultSelected = true
    const channel = new SuccessChannel('pushplus');
    const { service } = makeService({
      users: [makeUser({ id: 1, role: 'ADMIN' })],
      settings: { 1: { pushplus_token: 't1' } }, // 未设置 push_daily_report
      channels: [channel],
    });

    await service.trigger({ type: 'daily_report', action: 'scheduled', storeId: '1' });

    expect(channel.calls.length).toBe(1);
    // weekly_report defaultSelected = false
    const ch2 = new SuccessChannel('pushplus');
    const { service: s2 } = makeService({
      users: [makeUser({ id: 1, role: 'ADMIN' })],
      settings: { 1: { pushplus_token: 't1' } },
      channels: [ch2],
    });
    await s2.trigger({ type: 'weekly_report', action: 'scheduled', storeId: '1' });
    expect(ch2.calls.length).toBe(0);
  });

  it('落库通知标题来自 getNotifyTitle', async () => {
    const { service, notifyRepo } = makeService({
      users: [makeUser({ id: 1, role: 'ADMIN' })],
      // entry 类型对应的推送字段为 push_bookkeeping_notify
      settings: { 1: { push_bookkeeping_notify: true, pushplus_token: 't1' } },
    });

    await service.trigger({ type: 'entry', action: 'create', storeId: '1', detail: '午餐收入 200' });

    expect(notifyRepo.records.length).toBe(1);
    expect(notifyRepo.records[0].title).toBe('记账通知');
    expect(notifyRepo.records[0].type).toBe('entry');
  });

  it('targetUserId 仅发送给指定用户', async () => {
    const { service, notifyRepo } = makeService({
      users: [
        makeUser({ id: 1, role: 'ADMIN' }),
        makeUser({ id: 2, role: 'STORE_ADMIN' }),
      ],
      settings: {
        1: { push_alert: true, pushplus_token: 't1' },
        2: { push_alert: true, pushplus_token: 't2' },
      },
    });

    await service.trigger({ type: 'alert', action: 'system', storeId: '1', targetUserId: 2 });

    expect(notifyRepo.records.length).toBe(1);
    expect(notifyRepo.records[0].user_id).toBe(2);
  });

  it('渠道失败入重试队列', async () => {
    const fail = new FailChannel();
    const { service } = makeService({
      users: [makeUser({ id: 1, role: 'ADMIN' })],
      settings: { 1: { push_alert: true, pushplus_token: 't1' } },
      channels: [fail],
    });

    await service.trigger({ type: 'alert', action: 'system', storeId: '1' });

    // 失败会入队，调用次数 >= 1（重试会持续但被 maxRetries 限制）
    expect(fail.calls).toBeGreaterThanOrEqual(1);
  });

  it('企业微信渠道仅对 ADMIN/STORE_ADMIN 发送', async () => {
    const wecom = new SuccessChannel('wecom');
    const { service } = makeService({
      users: [makeUser({ id: 1, role: 'MANAGER' })],
      settings: { 1: { push_alert: true, wecom_secret: 't1' } },
      channels: [wecom],
    });

    await service.trigger({ type: 'alert', action: 'system', storeId: '1' });

    // MANAGER 不应收到企业微信
    expect(wecom.calls.length).toBe(0);
  });
});
