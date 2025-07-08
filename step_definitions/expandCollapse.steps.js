const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { expandSection, collapseSection, isSectionExpanded } = require('../utils/expandCollapseUtils.js');

Given('User navigates to the application', async function () {
  await this.page.goto(process.env.BASE_URL); // use your .env base URL
});

When('User expands the section {string}', async function (sectionName) {
  await expandSection(this.page, sectionName);
});

Then('The section {string} should be expanded', async function (sectionName) {
  const isExpanded = await isSectionExpanded(this.page, sectionName);
  expect(isExpanded).toBe(true);
});

When('User collapses the section {string}', async function (sectionName) {
  await collapseSection(this.page, sectionName);
});

Then('The section {string} should be collapsed', async function (sectionName) {
  const isExpanded = await isSectionExpanded(this.page, sectionName);
  expect(isExpanded).toBe(false);
});
