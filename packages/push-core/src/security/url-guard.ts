// 复用 @msp/shared 的 SSRF 防护
import { validateWebhookUrlAsync } from '@msp/shared/utils/network';

export async function assertSafeUrl(url: string): Promise<void> {
  const result = await validateWebhookUrlAsync(url);
  if (!result.valid) {
    throw new Error(result.error || 'URL 不安全');
  }
}

export async function isSafeUrl(url: string): Promise<boolean> {
  const result = await validateWebhookUrlAsync(url);
  return result.valid;
}
