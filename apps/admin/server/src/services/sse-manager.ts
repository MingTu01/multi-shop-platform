// SSE 服务端：维护客户端连接并广播 data-change 事件
import type { Response } from 'express';
import type { NotifyType } from '@msp/shared';

interface SseClient {
  res: Response;
  userId: number;
}

class SseManager {
  private clients: Set<SseClient> = new Set();

  add(client: SseClient): void {
    this.clients.add(client);
  }

  remove(client: SseClient): void {
    this.clients.delete(client);
  }

  size(): number {
    return this.clients.size;
  }

  // 广播数据变更
  broadcastDataChange(payload: { type: string; storeId?: string; unreadCount?: number }): void {
    const data = JSON.stringify(payload);
    for (const client of this.clients) {
      this.write(client, 'data-change', data);
    }
  }

  // 广播系统事件
  broadcastSystem(event: string, data?: unknown): void {
    const payload = JSON.stringify(data ?? { event });
    for (const client of this.clients) {
      this.write(client, 'system', payload);
    }
  }

  // 向单个用户推送
  sendToUser(userId: number, event: string, data: unknown): void {
    const payload = JSON.stringify(data);
    for (const client of this.clients) {
      if (client.userId === userId) {
        this.write(client, event, payload);
      }
    }
  }

  private write(client: SseClient, event: string, data: string): void {
    try {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${data}\n\n`);
    } catch {
      this.clients.delete(client);
    }
  }
}

export const sseManager = new SseManager();
export type { NotifyType };
