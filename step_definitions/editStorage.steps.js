const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const {
  login,
  switchToTabOrModule,
  goToInfraSection,
  openStorageModelOptions,
  editStorageForm,
} = require('../utils/commonFunctions');

Given('User is logged into the RunRun application', async function () {
  await login(this.page); // username/password handled in generic form
});

When('User navigates to {string} and selects infrastructure {string}', async function (section, infraName) {
  // Step 1: Switch to "My Infra" tab
  await switchToTabOrModule(this.page, { name: section });

  // Step 2: Click on three dots → View Infrastructure
  await goToInfraSection(this.page, section, infraName);
});

When('User goes to the {string} tab and selects model {string}', async function (tab, modelName) {
  await openStorageModelOptions(this.page, tab, modelName);
});

When('User edits the storage details using data from {string}', async function (jsonFile) {
  const filePath = path.resolve('testData', jsonFile);
  const inputData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  await editStorageForm(this.page, inputData);
});

Then('A toast message {string} should appear', async function (expectedMessage) {
  const toast = this.page.locator(`text=${expectedMessage}`);
  await toast.waitFor({ state: 'visible', timeout: 10000 });
  await expect(toast).toBeVisible();
});