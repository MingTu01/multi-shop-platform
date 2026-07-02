// 轻量定时调度器：每分钟 tick 一次，匹配 cron 规则后触发推送
import type { NotifyType } from '@msp/shared';
import type { SchedulerOpts, CronRule } from '../types.js';
import type { PushService } from '../core/push-service.js';
import type { StoresRepo } from '../repos/interfaces.js';

interface ScheduledJob {
  type: NotifyType;
  rule: CronRule;
}

export class Scheduler {
  private jobs: ScheduledJob[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private now: () => Date;
  private tickMs: number;
  private lastTick: { minute: number } | null = null;

  constructor(
    private pushService: PushService,
    private storesRepo: StoresRepo,
    opts: SchedulerOpts = {},
  ) {
    this.now = opts.now ?? (() => new Date());
    this.tickMs = opts.tickMs ?? 60_000;
  }

  schedule(type: NotifyType, rule: CronRule): void {
    this.jobs.push({ type, rule });
  }

  start(): void {
    if (this.timer) return;
    // 立即 tick 一次以校准 lastTick
    this.lastTick = this.minuteKey(this.now());
    this.timer = setInterval(() => void this.tick(), this.tickMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // 暴露给测试：手动触发一次 tick
  async tick(): Promise<void> {
    const date = this.now();
    const current = this.minuteKey(date);
    if (this.lastTick && this.lastTick.minute === current.minute) {
      // 同一分钟内不重复触发
      return;
    }
    this.lastTick = current;

    const matching = this.jobs.filter((j) => this.matches(j.rule, date));
    if (matching.length === 0) return;

    let storeIds: string[] = [];
    try {
      storeIds = await this.storesRepo.listStoreIds();
    } catch {
      return;
    }

    for (const job of matching) {
      for (const storeId of storeIds) {
        try {
          await this.pushService.trigger({
            type: job.type,
            action: 'scheduled',
            storeId,
          });
        } catch {
          // 单店失败不影响其他店
        }
      }
    }
  }

  private minuteKey(date: Date): { minute: number } {
    // 用分钟级时间戳作为去重 key
    return { minute: Math.floor(date.getTime() / 60000) };
  }

  private matches(rule: CronRule, date: Date): boolean {
    if (date.getHours() !== rule.hour) return false;
    if (date.getMinutes() !== rule.minute) return false;
    if (rule.dayOfWeek !== undefined && date.getDay() !== rule.dayOfWeek) return false;
    if (rule.dayOfMonth !== undefined && date.getDate() !== rule.dayOfMonth) return false;
    return true;
  }
}

// 注册报表类推送的默认调度
export function registerReportSchedules(scheduler: Scheduler): void {
  scheduler.schedule('daily_report', { hour: 22, minute: 0 });
  // 周一 = 1
  scheduler.schedule('weekly_report', { hour: 9, minute: 0, dayOfWeek: 1 });
  // 每月 1 日
  scheduler.schedule('monthly_report', { hour: 9, minute: 0, dayOfMonth: 1 });
}
