// 异步重试队列：失败任务指数退避重试
export interface RetryQueueOpts {
  maxRetries?: number;
  baseDelayMs?: number;
}

interface QueuedTask {
  task: () => Promise<void>;
  attempts: number;
}

export class RetryQueue {
  private queue: QueuedTask[] = [];
  private processing = false;
  private maxRetries: number;
  private baseDelayMs: number;
  private settled: Array<() => void> = [];

  constructor(opts: RetryQueueOpts = {}) {
    this.maxRetries = opts.maxRetries ?? 3;
    this.baseDelayMs = opts.baseDelayMs ?? 1000;
  }

  enqueue(task: () => Promise<void>): void {
    this.queue.push({ task, attempts: 0 });
    this.notifyIfIdle();
    void this.process();
  }

  size(): number {
    return this.queue.length;
  }

  // 等待所有任务处理完毕（测试用）
  async drain(): Promise<void> {
    if (this.queue.length === 0 && !this.processing) return;
    return new Promise<void>((resolve) => {
      this.settled.push(resolve);
    });
  }

  private notifyIfIdle(): void {
    if (this.queue.length === 0 && !this.processing) {
      const waiters = this.settled.splice(0);
      waiters.forEach((r) => r());
    }
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          await item.task();
          this.queue.shift();
        } catch (e) {
          item.attempts += 1;
          if (item.attempts > this.maxRetries) {
            // 超过重试次数，丢弃
            this.queue.shift();
          } else {
            // 指数退避
            const delay = this.baseDelayMs * Math.pow(2, item.attempts - 1);
            await sleep(delay);
          }
        }
      }
    } finally {
      this.processing = false;
      this.notifyIfIdle();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
