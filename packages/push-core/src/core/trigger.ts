// 触发层辅助函数（可选，便于宿主直接构造 NotifyParams）
import type { NotifyParams, NotifyType } from '@msp/shared';

export function buildParams(
  type: NotifyType,
  storeId: string,
  opts: { action?: string; detail?: string; targetUserId?: number; operatorName?: string } = {},
): NotifyParams {
  return {
    type,
    action: opts.action || 'trigger',
    storeId,
    detail: opts.detail,
    targetUserId: opts.targetUserId,
    operatorName: opts.operatorName,
  };
}
