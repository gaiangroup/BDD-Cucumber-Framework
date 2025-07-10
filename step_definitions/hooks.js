const { Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let browser;

Before(async function () {
  // Launch browser and disable geolocation popup
  browser = await chromium.launch({ headless: false }); // change to true if needed
  this.context = await browser.newContext({
    permissions: [], // 🚫 disables all permission prompts like geolocation
  });
  this.page = await this.context.newPage();
});

After(async function () {
  // Close browser after scenario
  await this.page?.close();
  await this.context?.close();
  await browser?.close();
});
