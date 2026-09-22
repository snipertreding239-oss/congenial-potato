import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const PORT = 4173;
const ROOT = path.resolve(process.cwd());
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RUN_SECONDS = Number(process.env.RUN_SECONDS || 260);

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Background browser started on http://127.0.0.1:${PORT}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(({ token, chatId }) => {
    // The existing HTML remains intact. These values are injected only into
    // this private server-side browser and are never committed to GitHub.
    localStorage.setItem('sniper_settings_signal', JSON.stringify({
      telegramToken: token,
      chatId,
      minConfluence: 85,
      rrTarget: 5,
      timeframe: '5m',
      minVolumeRatio: 2
    }));
    const email = 'background-monitor@local.invalid';
    localStorage.setItem('sniper_users_secure', JSON.stringify([{
      name: 'Background Monitor',
      email,
      passwordHash: ''
    }]));
    localStorage.setItem('sniper_logged_in_user', email);
  }, { token: TOKEN, chatId: CHAT_ID });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[page]', msg.text());
  });
  page.on('pageerror', err => console.error('[pageerror]', err.message));

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  console.log(`Signal engine running for ${RUN_SECONDS}s...`);

  await new Promise(resolve => setTimeout(resolve, RUN_SECONDS * 1000));
  await browser.close();
  server.close();
  console.log('Background run finished.');
});
