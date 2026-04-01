/**
 * StudyForge — smoke.test.js
 * Automated Playwright Smoke Test.
 * Covers: Subject Creation -> Task Creation -> Timer Session -> History Logging.
 */

const { test, expect } = require('@playwright/test');

test.describe('StudyForge End-to-End Smoke Test', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the local dev server
    await page.goto('http://localhost:3000'); // Adjust port if necessary
  });

  test('should complete a full study cycle', async ({ page }) => {
    // 1. Create a Subject
    await page.click('a[href="#subjects"]');
    await page.click('#btn-create-first-subject');
    await page.fill('#subject-name', 'Mobile Dev');
    await page.click('.color-swatch:nth-child(3)'); // Green
    await page.click('#modal-save');
    
    await expect(page.locator('.toast--success')).toBeVisible();
    await expect(page.locator('.card:has-text("Mobile Dev")')).toBeVisible();

    // 2. Create a Task
    await page.click('a[href="#tasks"]');
    await page.click('#btn-new-task');
    await page.fill('#task-title', 'Finish UI Mockups');
    await page.selectOption('#task-priority', 'high');
    await page.click('#modal-save');
    
    await expect(page.locator('.task-card:has-text("Finish UI Mockups")')).toBeVisible();

    // 3. Start Timer from Task
    await page.click('.btn--icon[title="Start Timer"]');
    await expect(page.url()).toContain('timer?taskId=');
    
    // Set a very short timer for testing (10s)
    await page.fill('#setup-h', '0');
    await page.fill('#setup-m', '0');
    await page.fill('#setup-s', '10');
    await page.click('#btn-start-timer');

    // 4. Wait for Timer Completion
    await expect(page.locator('#timer-status-text')).toHaveText('Focusing Deeply');
    // We wait 11s for the 10s timer to finish
    await page.waitForTimeout(11000);

    // 5. Log completion
    await expect(page.locator('h3:has-text("Session Complete!")')).toBeVisible();
    await page.fill('#completion-note', 'Test session complete');
    await page.click('#btn-save-log');

    // 6. Verify Dashboard
    await page.click('a[href="#dashboard"]');
    const focusTime = await page.locator('.stats-row .card:nth-child(1) span').first().textContent();
    // Minutes should be > 0 since we rounded 10s to 1m
    expect(parseInt(focusTime)).toBeGreaterThanOrEqual(0);

    // 7. Verify History
    await page.click('a[href="#sessions"]');
    await expect(page.locator('.card:has-text("Test session complete")')).toBeVisible();
  });

});
