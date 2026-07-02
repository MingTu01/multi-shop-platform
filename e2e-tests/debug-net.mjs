// Debug: trace network during navigation
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Log all requests/responses
  page.on('request', (req) => {
    if (req.url().includes('/api/')) console.log('REQ:', req.method(), req.url());
  });
  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      console.log('RES:', res.status(), res.url());
    }
  });
  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE_ERROR:', err.message));

  // Login
  console.log('=== LOGIN ===');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('input').nth(0).fill('admin');
  await page.locator('input').nth(1).fill('admin123');
  await page.locator('button', { hasText: /登录|进入/ }).first().click();
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());

  // Navigate to /dashboard
  console.log('\n=== GOTO /dashboard ===');
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('After /dashboard goto URL:', page.url());

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
