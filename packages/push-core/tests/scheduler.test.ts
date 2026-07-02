import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Scheduler, registerReportSchedules } from '../src/scheduler/scheduler.js';
import { RetryQueue } from '../src/scheduler/queue.js';

// 简易 PushService 替身（仅记录 trigger 调用）
function makePushServiceStub() {
  const calls: any[] = [];
  return {
    calls,
    async trigger(params: any) {
      calls.push(params);
    },
  };
}

describe('Scheduler', () => {
  it('匹配规则时对每个店铺触发 push', async () => {
    const push = makePushServiceStub();
    const storesRepo = { listStoreIds: async () => ['S1', 'S2'] };
    // 固定时间 22:00
    const fixedDate = new Date('2024-01-01T22:00:00');
    const scheduler = new Scheduler(push as any, storesRepo, { now: () => fixedDate, tickMs: 10 });
    scheduler.schedule('daily_report', { hour: 22, minute: 0 });

    await scheduler.tick();

    expect(push.calls.length).toBe(2);
    expect(push.calls[0].type).toBe('daily_report');
    expect(push.calls[0].storeId).toBe('S1');
  });

  it('不匹配规则时不触发', async () => {
    const push = makePushServiceStub();
    const storesRepo = { listStoreIds: async () => ['S1'] };
    const fixedDate = new Date('2024-01-01T10:30:00');
    const scheduler = new Scheduler(push as any, storesRepo, { now: () => fixedDate });
    scheduler.schedule('daily_report', { hour: 22, minute: 0 });

    await scheduler.tick();

    expect(push.calls.length).toBe(0);
  });

  it('支持 dayOfWeek 与 dayOfMonth', async () => {
    const push = makePushServiceStub();
    const storesRepo = { listStoreIds: async () => ['S1'] };

    // 周一 9:00 (2024-01-01 是周一)
    const monday = new Date('2024-01-01T09:00:00');
    const s1 = new Scheduler(push as any, storesRepo, { now: () => monday });
    s1.schedule('weekly_report', { hour: 9, minute: 0, dayOfWeek: 1 });
    await s1.tick();
    expect(push.calls.length).toBe(1);

    // 周二 9:00 不触发
    const tuesday = new Date('2024-01-02T09:00:00');
    push.calls.length = 0;
    const s2 = new Scheduler(push as any, storesRepo, { now: () => tuesday });
    s2.schedule('weekly_report', { hour: 9, minute: 0, dayOfWeek: 1 });
    await s2.tick();
    expect(push.calls.length).toBe(0);

    // 每月 1 日 9:00
    const firstOfMonth = new Date('2024-01-01T09:00:00');
    push.calls.length = 0;
    const s3 = new Scheduler(push as any, storesRepo, { now: () => firstOfMonth });
    s3.schedule('monthly_report', { hour: 9, minute: 0, dayOfMonth: 1 });
    await s3.tick();
    expect(push.calls.length).toBe(1);
  });

  it('同一分钟内不重复触发', async () => {
    const push = makePushServiceStub();
    const storesRepo = { listStoreIds: async () => ['S1'] };
    const fixedDate = new Date('2024-01-01T22:00:00');
    const scheduler = new Scheduler(push as any, storesRepo, { now: () => fixedDate });
    scheduler.schedule('daily_report', { hour: 22, minute: 0 });

    await scheduler.tick();
    await scheduler.tick(); // 同一分钟

    expect(push.calls.length).toBe(1);
  });

  it('registerReportSchedules 注册三种报表', async () => {
    const push = makePushServiceStub();
    const storesRepo = { listStoreIds: async () => ['S1'] };
    const scheduler = new Scheduler(push as any, storesRepo);
    registerReportSchedules(scheduler);
    // 内部 jobs 不可见，通过匹配时间间接验证
    const cases = [
      { date: new Date('2024-01-01T22:00:00'), expect: 1 }, // daily
      { date: new Date('2024-01-01T09:00:00'), expect: 2 }, // daily? no (22:00), weekly(周一9:00)+monthly(1日9:00) = 2
      { date: new Date('2024-01-02T09:00:00'), expect: 0 }, // 周二9:00 无匹配
    ];
    for (const c of cases) {
      push.calls.length = 0;
      // 重新创建以重置 lastTick
      const s = new Scheduler(push as any, storesRepo, { now: () => c.date });
      registerReportSchedules(s);
      await s.tick();
      expect(push.calls.length).toBe(c.expect);
    }
  });
});

describe('RetryQueue', () => {
  it('成功任务不入重试', async () => {
    const q = new RetryQueue({ baseDelayMs: 1 });
    let called = 0;
    q.enqueue(async () => {
      called += 1;
    });
    await q.drain();
    expect(called).toBe(1);
    expect(q.size()).toBe(0);
  });

  it('失败任务重试到 maxRetries', async () => {
    const q = new RetryQueue({ maxRetries: 2, baseDelayMs: 1 });
    let called = 0;
    q.enqueue(async () => {
      called += 1;
      throw new Error('fail');
    });
    await q.drain();
    // 初次 + 2 次重试 = 3 次
    expect(called).toBe(3);
  });
});
