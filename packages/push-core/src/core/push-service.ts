// PushService：推送触发主类
// 流程：角色过滤 → 取用户 → 取设置 → 渲染模板 → 落库通知 → 多渠道分发（失败入重试队列）
import type { NotifyType, NotifyParams, UserInfo, UserPushSettings } from '@msp/shared';
import { TYPE_TO_PUSH_FIELD, PUSH_TYPE_CONFIGS, isContentTypeAllowed, isAdmin, isStoreAdmin } from '@msp/shared';
import type { PushDeps, UserRepo, PushSettingsRepo, NotifyRepo } from '../repos/interfaces.js';
import type { PushChannel, ChannelSendOptions } from '../channels/channel.js';
import { getTemplate, registerTemplate } from '../templates/index.js';
import { RetryQueue } from '../scheduler/queue.js';
import type { TemplateFn } from '../types.js';

export class PushService {
  private queue: RetryQueue;

  constructor(private deps: PushDeps) {
    this.queue = new RetryQueue({ maxRetries: 3, baseDelayMs: 1000 });
  }

  registerTemplate(type: NotifyType, fn: TemplateFn): void {
    registerTemplate(type, fn);
  }

  // 主触发入口
  async trigger(params: NotifyParams): Promise<void> {
    const { type, storeId, targetUserId } = params;
    if (!storeId) {
      this.deps.logger?.error('trigger 缺少 storeId');
      return;
    }

    // 1. 解析所有可接收该类型的角色（来自 ROLE_ALLOWED_TYPES）
    const targetRoles = this.resolveTargetRoles(type);
    if (targetRoles.length === 0) {
      return;
    }

    // 2. 取目标用户
    const users: UserInfo[] = [];
    for (const role of targetRoles) {
      try {
        const list = await this.deps.userRepo.findByStoreAndRole(storeId, role);
        users.push(...list);
      } catch (e) {
        this.deps.logger?.error('findByStoreAndRole 失败 role=' + role, e);
      }
    }

    // 3. targetUserId 过滤
    let filtered = users;
    if (targetUserId !== undefined) {
      filtered = users.filter((u) => u.id === targetUserId);
    }

    // 4. 去重
    const seen = new Set<number>();
    for (const user of filtered) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      try {
        await this.dispatchToUser(user, params);
      } catch (e) {
        this.deps.logger?.error('dispatchToUser 失败 user=' + user.id, e);
      }
    }
  }

  // 直接发送给单个用户（调度器用）
  async sendToUser(userId: number, type: NotifyType, params: NotifyParams): Promise<void> {
    const user = await this.deps.userRepo.findById(userId);
    if (!user) {
      this.deps.logger?.error('sendToUser 用户不存在 id=' + userId);
      return;
    }
    await this.dispatchToUser(user, { ...params, type });
  }

  private async dispatchToUser(user: UserInfo, params: NotifyParams): Promise<void> {
    const type = params.type;
    const settings = await this.deps.settingsRepo.getByUser(user.id);

    // 5. 检查该用户是否开启此类型推送
    const pushField = TYPE_TO_PUSH_FIELD[type];
    const enabled = this.isPushEnabled(settings, pushField, type);
    if (!enabled) {
      return;
    }

    // 6. 渲染模板
    const rendered = getTemplate(type)({
      type,
      params,
      operatorName: params.operatorName,
    });

    // 7. 落库通知
    try {
      await this.deps.notifyRepo.insert({
        user_id: user.id,
        title: rendered.title,
        link: rendered.link,
        type,
        detail: params.detail,
      });
    } catch (e) {
      this.deps.logger?.error('notifyRepo.insert 失败', e);
    }

    // 8. 多渠道分发
    await this.dispatchChannels(user, settings, rendered);
  }

  private async dispatchChannels(
    user: UserInfo,
    settings: UserPushSettings,
    rendered: { title: string; content: string; link?: string },
  ): Promise<void> {
    for (const channel of this.deps.channels) {
      const token = this.getChannelToken(settings, channel.key);
      if (!token) continue;

      // 企业微信仅管理员
      if (channel.key === 'wecom' && !isAdmin(user.role) && !isStoreAdmin(user.role)) {
        continue;
      }

      const opts: ChannelSendOptions = {
        token,
        title: rendered.title,
        content: rendered.content,
        link: rendered.link,
      };

      // 失败入队重试
      this.queue.enqueue(async () => {
        const result = await channel.send(opts);
        if (!result.ok) {
          this.deps.logger?.error('渠道发送失败 channel=' + channel.key + ' user=' + user.id + ' err=' + (result.error || ''), null);
          throw new Error(result.error || 'send failed');
        }
      });
    }
  }

  private resolveTargetRoles(type: NotifyType): string[] {
    const config = PUSH_TYPE_CONFIGS.find((c) => c.type === type);
    if (config && config.roles.length > 0) {
      return config.roles;
    }
    // 回退到 ROLE_ALLOWED_TYPES
    const roles = ['ADMIN', 'STORE_ADMIN', 'MANAGER', 'STAFF', 'SHAREHOLDER'];
    return roles.filter((r) => isContentTypeAllowed(r, type));
  }

  // 字段未定义时使用 defaultSelected
  private isPushEnabled(settings: UserPushSettings, pushField: string | undefined, type: NotifyType): boolean {
    if (!pushField) return false;
    if (settings[pushField] !== undefined) {
      return !!settings[pushField];
    }
    const config = PUSH_TYPE_CONFIGS.find((c) => c.type === type);
    return config ? config.defaultSelected : false;
  }

  private getChannelToken(settings: UserPushSettings, channelKey: string): string | undefined {
    switch (channelKey) {
      case 'pushplus':
        return settings.pushplus_token;
      case 'wecom':
        return settings.wecom_secret;
      case 'iyuu':
        return settings.iyuu_token;
      default:
        return undefined;
    }
  }
}

// 导出依赖类型便于宿主实现
export type { PushDeps, UserRepo, PushSettingsRepo, NotifyRepo };
export type { PushChannel };
