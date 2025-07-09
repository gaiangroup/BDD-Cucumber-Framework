const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { expect } = require('chai');
const { handleGenericForm,waitUntilPageIsReady } = require('../utils/commonFunctions');
const login_testData = require('../testData/login.json');

let browser;

Before(async function () {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    this.page = await context.newPage();
});

After(async function () {
    await browser.close();
});

Given('User navigate to the login page', async function () {
    await this.page.goto('https://qa-runrun-ui.aidtaas.com/');
});

When('User login with valid credentials and successful login', { timeout: 50000 }, async function () {
    await handleGenericForm(this.page, login_testData.login_form);
    await waitUntilPageIsReady(this.page);
});

Then('User login with invalid credentials', async function () {
    await handleGenericForm(this.page, login_testData.login_Invalidcred);
     
});


Then('User should see the Dashboard as home page', async function () {
    console.log("Login successful, checking for Dashboard...");
});
