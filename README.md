# Sri Lanka Dragon Sniper — Background Telegram Signals

The original `index.html` is kept intact. A private headless Chromium instance runs the existing JavaScript signal engine on GitHub Actions, so the user's phone/browser does not need to keep the website open.

## GitHub setup

1. Put every file in this folder into your GitHub repository.
2. In GitHub: Settings → Secrets and variables → Actions → New repository secret.
3. Add:
   - `TELEGRAM_BOT_TOKEN` = your BotFather token
   - `TELEGRAM_CHAT_ID` = your Telegram chat/channel ID
4. Go to Actions → Background Trading Signals → Run workflow once to test.
5. The scheduled workflow starts approximately every 5 minutes and runs the existing signal engine for about 4 minutes 20 seconds.

## Important

Do NOT put the Telegram token inside `index.html` or commit it to the repository.

GitHub Actions scheduled jobs are best-effort and can be delayed or paused by GitHub. This is therefore not a guaranteed 24/7 trading-grade service. For strict continuous monitoring, run the same `monitor/runner.mjs` on a VPS/Render/Railway/background worker instead.
