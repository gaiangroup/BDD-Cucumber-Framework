const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {
  openTriggerIfPresent,
  expandSection,
  collapseSection,
  isSectionExpanded
} = require('../utils/commonFunctions.js');
const expandCollapseConfig = require('../testData/expandCollapseConfig.json');

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
  expect(isExpanded).toBe(true);
});

Then('Section should be collapsed for {string}', async function (key) {
  const config = expandCollapseConfig[key];
  if (!config) throw new Error(`Missing config for: ${key}`);

  // Try to click collapse button only if it is visible
  if (config.collapseButtonSelector) {
    const collapseBtn = this.page.locator(config.collapseButtonSelector);
    if (await collapseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await collapseBtn.click();
    } else {
      console.warn(`Collapse button not visible for selector: ${config.collapseButtonSelector}`);
    }
  } else if (config.sectionLabel) {
    await collapseSection(this.page, config.sectionLabel);
  }

  // Wait for the panel to be hidden if a selector is provided
  let isExpanded = true;
  if (config.panelSelector) {
    try {
      await this.page.locator(config.panelSelector).waitFor({ state: 'hidden', timeout: 10000 });
      isExpanded = false;
    } catch {
      isExpanded = await this.page.locator(config.panelSelector).isVisible();
    }
  } else if (config.sectionLabel) {
    isExpanded = await isSectionExpanded(this.page, config.sectionLabel);
  }
  expect(isExpanded).toBe(false);
});