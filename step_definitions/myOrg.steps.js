const { When, Then, Before, After, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { handleGenericForm, switchToTabOrModule, scrollContainerById, clickButton, threeDotActionMenu, handlePopupSimple,waitUntilPageIsReady, waitUntilpagedomcontentloaded,waitUntilpagenetworkidle,waitUntilpageload, performKeyboardActions, sendAndValidateInvites, validateTableHeadersAndRow } = require('../utils/commonFunctions');
const myOrg_json = require('../testData/myOrg.json');
const tableData = require('../testData/tableData.json');

const fs = require('fs');
const path = require('path');

Before(async function () {
    this.browser = await chromium.launch({ headless: false });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
});

After(async function (scenario) {
    if (scenario.result?.status === Status.FAILED) {
        if (this.page) {
            const fileName = `${scenario.pickle.name.replace(/ /g, '_')}_${Date.now()}.png`;
            const filePath = `./reports/screenshots/${fileName}`;
            const screenshot = await this.page.screenshot({ path: filePath, fullPage: true });
            await this.attach(fs.readFileSync(filePath), 'image/png');

            console.log(`Screenshot captured for failed scenario: ${scenario.pickle.name}`);
            console.log(`Error in: ${scenario.pickle.uri} at step: ${scenario.pickle.steps.map(s => s.text).join(' -> ')}`);
        }
    }
    if (this.browser) {
        await this.browser.close();
    }
});

When('User switches to My Organization tab', { timeout: 20000 }, async function () {
    await waitUntilpagedomcontentloaded(this.page);
    await switchToTabOrModule(this.page, myOrg_json.tabs[0]);
});

When('User clicks on Role tab', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await switchToTabOrModule(this.page, myOrg_json.tabs[1]);
});

When('User allows location access', { timeout: 20000 }, async function () {
    await this.page.waitForTimeout(2000);
    await performKeyboardActions(this.page, myOrg_json.keyboardAction);
});

When('User clicks on New Role button', { timeout: 20000 }, async function () {
    await this.page.waitForTimeout(2000);
    await clickButton(this.page, myOrg_json.button[1]);
});

Then('User should see the role creation form and fill in the details', { timeout: 20000 }, async function () {
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper1);
    console.log("Stepper 1 form submitted. Waiting before filling Stepper 2...");
    await waitUntilPageIsReady(this.page); // Ensure page is ready before next step
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper2);
    console.log("Stepper 2 form submitted. Waiting before filling Stepper 3...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await waitUntilPageIsReady(this.page);
    await handleGenericForm(this.page, myOrg_json.roleForm_stepper3);
});

// ********************Team Creation Steps*****************************************
When('User clicks on Teams tab', { timeout: 20000 }, async function () {
    await this.page.reload();
    await waitUntilPageIsReady(this.page);
    await switchToTabOrModule(this.page, myOrg_json.tabs[2]);
});

When('User clicks on Add Team button', { timeout: 20000 }, async function () {
    await this.page.reload();
    await this.page.waitForTimeout(2000);
    await clickButton(this.page, myOrg_json.button[2]);
});

Then('User should see the Team creation form and fill in the details', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await handleGenericForm(this.page, myOrg_json.teamCreation_form);
});

//********************User Invitation******************/
When('User clicks on Users tab', { timeout: 20000 }, async function () {
    await this.page.reload();
    await waitUntilPageIsReady(this.page);

    await switchToTabOrModule(this.page, myOrg_json.tabs[3]);
});

When('User clicks on Invite Users button', { timeout: 120 * 1000 }, async function () {
    await this.page.reload();
    await waitUntilPageIsReady(this.page);
    await clickButton(this.page, myOrg_json.button[3]);
    console.log("Invite Users button clicked. Waiting for form to appear...");
});

Then('User should send the invitation and validate the subject', { timeout: 120 * 1000 }, async function () {

    await waitUntilPageIsReady(this.page);
    const result = await sendAndValidateInvites(this.page, myOrg_json);
    console.log(result);
});

Then('User should click on the invite popup', { timeout: 120 * 1000 }, async function () {

    await waitUntilPageIsReady(this.page);
    const result1 = await clickButton(this.page, myOrg_json.button[4]);
    console.log(result1);
});


Then(
    'User clicks on {string} tab and validates the table',
    { timeout: 60000 },
    async function (tabName) {
        const tabIndex = myOrg_json.tabs.findIndex(
            tab => tab.label === tabName || tab.name === tabName
        );
        if (tabIndex === -1) {
            throw new Error(`Tab "${tabName}" not found in myOrg_json.tabs`);
        }
     await waitUntilpageload(this.page);
     await switchToTabOrModule(this.page, myOrg_json.tabs[tabIndex]);
        // ✅ Use tableData, which is correctly imported above
        const tableInfo = tableData[tabName];

        if (!tableInfo) {
            throw new Error(`No test data found for table: "${tabName}"`);
        }
         await waitUntilpagenetworkidle(this.page);
        await validateTableHeadersAndRow(this.page, tableInfo.expectedHeaders, tableInfo.expectedRow);
        await waitUntilpageload(this.page);
    }
);





When('User performing scroll action to the bottom', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await scrollContainerById(this.page, myOrg_json.scrollContainer);
});

//********************Delete Role******************/
When('User clicks on three dot action menu to delete Role', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await threeDotActionMenu(this.page, myOrg_json.menuAction_Role);
});

Then('User should see able to delete the role successfully', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await handlePopupSimple(this.page, myOrg_json.deleteItem);
});

//********************Delete Team******************/
When('User clicks on three dot action menu to delete Team', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await threeDotActionMenu(this.page, myOrg_json.menuAction_Team);
});

Then('User should see able to delete the Team successfully', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await handlePopupSimple(this.page, myOrg_json.deleteItem);
});


