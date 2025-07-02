const { Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { expect } = require('chai');
const { handleGenericForm,switchToTabOrModule,clickButton } = require('../utils/commonFunctions');
const myOrg_json = require('../testData/myOrg.json');

let browser;

Before(async function () {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    this.page = await context.newPage();
});

After(async function () {
    await browser.close();
});

Then('User switch to My Organization tab', async function () {
    await switchToTabOrModule(this.page, myOrg_json.tabs[0]);
});


Then('User click on Role tab', async function () {
    await switchToTabOrModule(this.page, myOrg_json.tabs[1]);
});

Then('User click on New Role button', async function () {
    await clickButton(this.page, myOrg_json.button[1]);
});

Then('User should see role creation form and fill in the details', async function () {
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper1);
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper2);
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper3);
});
