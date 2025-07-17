const { BeforeAll,AfterAll,Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { expect } = require('chai');
const { handleGenericForm, waitUntilPageIsReady, handleAssertions,interceptAndValidateApi } = require('../utils/commonFunctions');
const login_testData = require('../testData/login.json');
const apiTestData = require('../testData/apisData.json');

//const { BeforeAll } = require('cucumber-js');
//const { AfterAll } = require('cucumber-js');

let browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
});

Before(async function () {
  this.context = await browser.newContext({ viewport: null });
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});

Given('User navigate to the login page', { timeout: 20000 }, async function () {
    await this.page.goto(login_testData.baseUrl);
});

When('User verifies all input field labels are correct', { timeout: 20000 }, async function () {
    await handleAssertions(this.page, login_testData.texts);
});

When('User verifies placeholder text for each field is correct', { timeout: 20000 }, async function () {
    await handleAssertions(this.page, login_testData.placeholders);
});// When('User login with valid credentials and successful login', { timeout: 50000 }, async function () {
//     await handleGenericForm(this.page, login_testData.login_form);
//     await waitUntilPageIsReady(this.page);
// });

Then(
  'validate API {string} is called with correct request and response',
  { timeout: 20000 },
  async function (apiName) {
    const config = apiTestData[apiName];
    if (!config) throw new Error(`❌ API config not found for: ${apiName}`);
    
    // Create a promise for the API interception BEFORE triggering the action
    const apiPromise = interceptAndValidateApi(this.page, config);
    
    // Trigger the action that will call the API
    await handleGenericForm(this.page, login_testData.login_form);
    
    // Now wait for the API interception
    const intercepted = await apiPromise;

    // Optional HTTP status code check
    if (intercepted.statusCode && intercepted.statusCode !== 200) {
      throw new Error(`❌ Expected HTTP status 200 but got ${intercepted.statusCode}`);
    }

    console.log(`✅ Successfully validated API: ${apiName}`);
  }
);

Then('User attempts login with an invalid email and invalid password,and verifies the error', { timeout: 20000 }, async function () {
    await handleGenericForm(this.page, login_testData.negativeTestData_1);
});

Then('User attempts login with a valid email and an invalid password,and verifies the error', { timeout: 20000 }, async function () {
    await this.page.reload();
    await handleGenericForm(this.page, login_testData.negativeTestData_2);
});

Then('User should see the Dashboard as home page', async function () {
    await handleAssertions(this.page, login_testData.screenshots);
});