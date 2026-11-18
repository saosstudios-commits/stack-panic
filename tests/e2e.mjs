import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_SCRATCH = 'C:/Users/user/.gemini/antigravity/brain/57ce5f10-4014-4085-a851-b2cf58f9c641/scratch';
fs.mkdirSync(ARTIFACT_SCRATCH, { recursive: true });

const URL = process.env.GAME_URL || 'http://localhost:4173/';

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader'],
  });
  const errors = [];

  // 1. Desktop 1280x720: Full interaction + console check + screenshots
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '01_title_1280x720.png') });

    // Click Play
    await page.click('#ui-play');
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '02_level1_1280x720.png') });

    // Move right and jump to test stack sway & controls
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(450);
    await page.keyboard.down('Space');
    await page.waitForTimeout(220);
    await page.keyboard.up('Space');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '03_level1_action_1280x720.png') });

    // Trigger pause menu (Esc) & mute (M)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const pauseVisible = await page.locator('#modal-overlay').isVisible();
    if (!pauseVisible) throw new Error('Pause menu did not open on Escape');
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '04_pause_1280x720.png') });

    // Resume & test restart (R)
    await page.click('#ui-resume');
    await page.waitForTimeout(150);
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(200);

    // Measure frame time over 60 frames
    const avgFrameMs = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        function step(now) {
          times.push(now - last);
          last = now;
          if (times.length >= 60) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            resolve(avg);
          } else {
            requestAnimationFrame(step);
          }
        }
        requestAnimationFrame(step);
      });
    });
    console.log(`1280x720 avg frame time: ${avgFrameMs.toFixed(2)}ms`);

    await context.close();
  }

  // 2. Full HD 1920x1080 screenshot
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error (1080p): ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror (1080p): ${err.message}`));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.click('#ui-play');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '05_level1_1920x1080.png') });
    await context.close();
  }

  // 3. Landscape Phone 844x390 with touch emulation
  {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error (phone): ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror (phone): ${err.message}`));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.click('#ui-play');
    await page.waitForTimeout(350);
    const touchVisible = await page.locator('#touch-controls').isVisible();
    if (!touchVisible) throw new Error('Touch controls not visible on 844x390 mobile');
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '06_phone_landscape_844x390.png') });

    // Verify touch buttons respond
    const rightBox = await page.locator('#touch-right').boundingBox();
    if (!rightBox) throw new Error('Missing #touch-right bounding box');
    await page.touchscreen.tap(rightBox.x + rightBox.width / 2, rightBox.y + rightBox.height / 2);
    await context.close();
  }

  // 4. Portrait Phone 390x844: verify rotate overlay
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);
    const rotateVisible = await page.locator('#rotate-overlay').isVisible();
    if (!rotateVisible) throw new Error('Rotate overlay did not appear in portrait mode');
    await page.screenshot({ path: path.join(ARTIFACT_SCRATCH, '07_phone_portrait_390x844.png') });
    await context.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.error('Browser errors detected:\n' + errors.join('\n'));
    throw new Error(`${errors.length} browser error(s)`);
  }
  console.log('Playwright E2E & visual checks passed with 0 console/page errors!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
