// Debug: check cookie persistence after login
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('input').nth(0).fill('admin');
  await page.locator('input').nth(1).fill('admin123');
  await page.locator('button', { hasText: /登录|进入/ }).first().click();
  await page.waitForTimeout(2500);

  console.log('After login URL:', page.url());

  // Check cookies
  const cookies = await context.cookies();
  console.log('Cookies after login:', JSON.stringify(cookies, null, 2));

  // Check what /api/auth/me returns via fetch in the page context
  const meResult = await page.evaluate(async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    return { status: res.status, body: await res.text() };
  });
  console.log('Auth/me in page context:', meResult.status, meResult.body.slice(0, 200));

  // Now navigate to /dashboard
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('After /dashboard goto URL:', page.url());
  const cookies2 = await context.cookies();
  console.log('Cookies after dashboard:', JSON.stringify(cookies2, null, 2));

  // Take a screenshot
  await page.screenshot({ path: '/workspace/e2e-reports/screenshots/debug-dashboard.png', fullPage: true });
  console.log('Screenshot saved');

  // Print page title and visible body text
  const body = await page.locator('body').textContent();
  console.log('Body text (first 500):', body?.slice(0, 500));

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
