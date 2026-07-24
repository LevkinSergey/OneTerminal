import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const TEST_HTML = path.resolve(__dirname, '../tests/1c-tests.html');

test.describe('1C Tests HTML', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(TEST_HTML)) {
      throw new Error(`Test HTML not found: ${TEST_HTML}`);
    }
  });

  test('loads and runs QUnit tests', async ({ page }) => {
    await page.goto(`file://${TEST_HTML}`);
    await page.waitForSelector('#qunit', { timeout: 30000 });

    await page.waitForFunction(() => {
      const qunit = window.QUnit;
      return qunit && qunit.config && qunit.config.queue && qunit.config.queue.length === 0;
    }, { timeout: 60000 });

    const failedCount = await page.evaluate(() => {
      const failed = document.querySelectorAll('#qunit-tests li.fail');
      return failed.length;
    });

    if (failedCount > 0) {
      const failures = await page.evaluate(() => {
        const failed = document.querySelectorAll('#qunit-tests li.fail');
        return Array.from(failed).map(el => el.textContent?.trim() || '');
      });
      console.log('Test failures:', failures);
    }

    expect(failedCount).toBe(0);
  });
});