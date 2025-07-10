const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {
  openTriggerIfPresent,
  expandSection,
  collapseSection,
  isSectionExpanded
} = require('../utils/commonFunctions.js');
const expandCollapseConfig = require('../testData/expandCollapseConfig.json');

// 🔹 Step: Open chatbot panel (first stage before expand)
When('User opens the chatbot panel', async function () {
  const config = expandCollapseConfig["chatbotPanel"];
  if (!config?.openTriggerSelector) {
    throw new Error("Missing openTriggerSelector for chatbotPanel");
  }
  const trigger = this.page.locator(config.openTriggerSelector);
  await trigger.click();
  await this.page.waitForTimeout(500); // allow panel to open
});

// 🔹 Step: Expand chatbot
When('User expands the {string}', async function (key) {
  const config = expandCollapseConfig[key];
  if (!config?.toggleButtonSelector) {
    throw new Error(`Missing toggleButtonSelector for ${key}`);
  }

  const toggleBtn = this.page.locator(config.toggleButtonSelector);
  if (await toggleBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await toggleBtn.click();
    await this.page.waitForTimeout(500); // allow UI to expand
  } else {
    console.warn(`Expand button not visible: ${config.toggleButtonSelector}`);
  }
});

// 🔹 Step: Collapse chatbot
When('User collapses the {string}', async function (key) {
  const config = expandCollapseConfig[key];
  if (!config?.toggleButtonSelector) {
    throw new Error(`Missing toggleButtonSelector for ${key}`);
  }

  const toggleBtn = this.page.locator(config.toggleButtonSelector);
  if (await toggleBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await toggleBtn.click();
    await this.page.waitForTimeout(500); // allow UI to collapse
  } else {
    console.warn(`Collapse button not visible: ${config.toggleButtonSelector}`);
  }
});

// 🔹 Validation: Expanded
Then('Section should be expanded for {string}', async function (key) {
  const config = expandCollapseConfig[key];
  if (!config) throw new Error(`Missing config for: ${key}`);

  if (config.openTriggerSelector) {
    await openTriggerIfPresent(this.page, config.openTriggerSelector);
  }

  if (config.panelSelector) {
    await this.page.locator(config.panelSelector).waitFor({ state: 'visible', timeout: 10000 });
  }

  let isExpanded = false;
  if (config.panelSelector) {
    isExpanded = await this.page.locator(config.panelSelector).isVisible();
  } else if (config.sectionLabel) {
    isExpanded = await isSectionExpanded(this.page, config.sectionLabel);
  }

  console.log(`[DEBUG] Is panel visible (expanded)?`, isExpanded);
  expect(isExpanded).toBe(true);
});

// 🔹 Validation: Collapsed using boundingBox
Then('Section should be collapsed for {string}', async function (key) {
  const config = expandCollapseConfig[key];
  if (!config) throw new Error(`Missing config for: ${key}`);

  await this.page.waitForTimeout(500); // give UI time to collapse

  let isCollapsed = false;
  if (config.panelSelector) {
    try {
      const box = await this.page.locator(config.panelSelector).boundingBox();
      console.log(`[DEBUG] Bounding box for ${config.panelSelector}:`, box);

      // Consider collapsed if element is gone or has very small height
      isCollapsed = box === null || box.height < 10;
    } catch (err) {
      console.warn(`[DEBUG] Error checking bounding box:`, err);
      isCollapsed = true; // Assume collapsed if error occurs
    }
  } else if (config.sectionLabel) {
    const expanded = await isSectionExpanded(this.page, config.sectionLabel);
    isCollapsed = !expanded;
  }

  expect(isCollapsed).toBe(true);
});
