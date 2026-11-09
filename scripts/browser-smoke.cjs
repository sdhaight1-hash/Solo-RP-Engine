// Run with Playwright available. Start npm start in another terminal first.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: '+ New adventure' }).click();
    await page.locator('#name').fill('The haunted shore'); await page.locator('#new-setting').fill('Coastal mystery'); await page.locator('#new-scope').fill('Find the missing keeper');
    await page.getByRole('button', { name: 'Create adventure' }).click();
    await page.locator('#entry').fill('<img src=x onerror=alert(1)> Arrival at the lighthouse'); await page.locator('#entry-submit').click();
    assert.equal(await page.locator('#journal img').count(), 0);
    await page.getByRole('button', { name: 'Edit entry', exact: true }).click(); await page.locator('#entry').fill('Arrival at the lighthouse — revised'); await page.locator('#entry-submit').click();
    await page.getByRole('button', { name: 'Characters', exact: true }).click();
    await page.locator('#character-name').fill('Mara'); await page.locator('#character-notes').fill('Investigator'); await page.locator('#character-submit').click();
    await page.getByRole('button', { name: 'Edit character', exact: true }).click(); await page.locator('#character-notes').fill('A determined investigator'); await page.locator('#character-submit').click();
    await page.getByRole('button', { name: 'Oracles & dice', exact: true }).click();
    await page.locator('#table-name').fill('Weather'); await page.locator('#table-entries').fill('Fog\nRain\nClear'); await page.locator('#table-submit').click();
    await page.locator('#question').fill('What is the weather?'); await page.locator('#draw-button').click();
    await page.locator('#dice').fill('2d6+1'); await page.getByRole('button', { name: 'Roll dice', exact: true }).click();
    await page.getByRole('button', { name: 'Plot & scenes', exact: true }).click();
    await page.locator('#scene-name').fill('The lighthouse'); await page.locator('#scene-notes').fill('A storm is gathering'); await page.getByRole('button', { name: 'Add scene', exact: true }).click();
    await page.locator('#beat-body').fill('The keeper left a coded message'); await page.getByRole('button', { name: 'Invoke beat', exact: true }).click();
    assert.equal(await page.locator('#progress-summary').textContent(), '0 / 8');
    await page.getByRole('button', { name: 'Confirm relevance', exact: true }).click(); assert.equal(await page.locator('#progress-summary').textContent(), '1 / 8');
    await page.locator('#node-name').fill('Where is the keeper?'); await page.locator('#node-type').selectOption('Pending question'); await page.getByRole('button', { name: 'Add node', exact: true }).click();
    await page.reload(); assert.equal(await page.locator('#title').textContent(), 'The haunted shore'); assert.equal(await page.locator('#progress-summary').textContent(), '1 / 8');
    assert.match(await page.locator('#journal').textContent(), /revised/);
    const downloaded = page.waitForEvent('download'); await page.locator('#export').click(); const download = await downloaded; const path = await download.path();
    const saved = JSON.parse(require('node:fs').readFileSync(path, 'utf8')); assert.equal(saved.characters[0].notes, 'A determined investigator'); assert.equal(saved.log.length, 4);
    const fresh = await browser.newContext(); const imported = await fresh.newPage(); await imported.goto('http://localhost:3000');
    await imported.locator('#import').setInputFiles(path); await imported.waitForFunction(() => document.querySelector('#title').textContent === 'The haunted shore');
    assert.equal(await imported.locator('#progress-summary').textContent(), '1 / 8');
    await imported.locator('#import').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"version":99}') });
    await imported.waitForFunction(() => document.querySelector('#status').textContent.startsWith('Import failed:'));
    assert.equal(await imported.locator('#title').textContent(), 'The haunted shore');
    // Switching does not leak unsaved editors between campaigns.
    await page.locator('#campaigns').selectOption('0'); assert.equal(await page.locator('#journal .entry-card').count(), 0); await page.locator('#campaigns').selectOption('1');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: '/tmp/solo-rp-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: '/tmp/solo-rp-desktop.png', fullPage: true });
    // Two tabs must not silently overwrite one another.
    const other = await context.newPage(); await other.goto('http://localhost:3000');
    await page.locator('#entry').fill('A new clue'); await page.locator('#entry-submit').click();
    await other.locator('#conflict').waitFor({ state: 'visible' });
    // Corrupt saves remain intact until explicit recovery.
    const recovery = await browser.newContext(); const damaged = await recovery.newPage(); await damaged.goto('http://localhost:3000');
    await damaged.evaluate(() => localStorage.setItem('solo-rp-engine-v1', 'broken')); await damaged.reload();
    await damaged.locator('#recovery').waitFor({ state: 'visible' }); await damaged.locator('#entry').fill('Unsaved rescue note'); await damaged.locator('#entry-submit').click();
    assert.equal(await damaged.evaluate(() => localStorage.getItem('solo-rp-engine-v1')), 'broken');
    assert.deepEqual(errors, []);
    console.log('PASS: campaign setup, safe text, editing, tables, rolls, scenes, beat confirmation, reload, export/import, invalid imports, mobile layout, cross-tab conflict, corrupt-save preservation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
