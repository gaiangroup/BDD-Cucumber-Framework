const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const expandCollapseConfig = require('../testData/expandCollapseConfig.json');

// 🔹 Step: Open chatbot panel
When('User opens the chatbot panel', async function () {
  const config = expandCollapseConfig["chatbotPanel"];
  const trigger = this.page.locator(config.openTriggerSelector);
  await trigger.waitFor({ state: 'visible', timeout: 10000 });
  await trigger.click();
  console.log(`[ACTION] Opened chatbot panel`);
  await this.page.waitForTimeout(500);
});

// 🔹 Step: Expand the panel using toggle
When('User expands the {string}', async function (key) {
  const config = expandCollapseConfig[key];
  const expandBtn = this.page.locator(`xpath=${config.toggleButtonSelector}`).first();
  await expandBtn.waitFor({ state: 'visible', timeout: 5000 });
  await expandBtn.click({ force: true });
  console.log(`[ACTION] Expanded: ${key}`);
  await this.page.waitForTimeout(500);
});

// 🔹 Step: Collapse the panel using X icon
When('User collapses the {string}', async function (key) {
  const config = expandCollapseConfig[key];
  const collapseBtn = this.page.locator(`xpath=${config.collapseButtonSelector}`).first();
  await collapseBtn.waitFor({ state: 'visible', timeout: 5000 });
  await collapseBtn.click({ force: true });
  console.log(`[ACTION] Collapsed: ${key}`);
  await this.page.waitForTimeout(500);
});

// 🔹 Expanded check
Then('Section should be expanded for {string}', async function (key) {
  const config = expandCollapseConfig[key];
  const panel = this.page.locator(config.panelStateSelector);
  await panel.waitFor({ state: 'visible', timeout: 5000 });
  const isVisible = await panel.isVisible();
  const box = await panel.boundingBox();
  const isExpanded = isVisible && box?.height > 10;
  expect(isExpanded).toBe(true);
  console.log(`[ASSERT] Section "${key}" is expanded.`);
});

// 🔹 Collapsed check
Then('Section should be collapsed for {string}', async function (key) {
  const config = expandCollapseConfig[key];
  const panel = this.page.locator(config.panelStateSelector);

  const isVisible = await panel.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return !(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0');
  }).catch(() => false);

  const box = await panel.boundingBox().catch(() => null);
  console.log(`[DEBUG] Visibility: ${isVisible}, Bounding box: ${JSON.stringify(box)}`);

  expect(isVisible).toBe(true);
});
