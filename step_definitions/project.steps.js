const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { expect } = require('chai');
const { handleGenericForm, waitUntilPageIsReady, handlePopupSimple, switchToTabOrModule,threeDotActionMenu, clickButton, waitUntilpagenetworkidle, waitUntilpageload } = require('../utils/commonFunctions');
const project_testData = require('../testData/project.json');
const { BeforeAll } = require('cucumber-js');
const { AfterAll } = require('cucumber-js');




When('User should switch to projects tab', { timeout: 20000 }, async function () {
    await switchToTabOrModule(this.page, project_testData.tabs);
    await waitUntilPageIsReady(this.page);
});

When('User clicks Add Project button', { timeout: 20000 }, async function () {

    await this.page.waitForTimeout(3000);
    await clickButton(this.page, project_testData.button[0]);
    await waitUntilPageIsReady(this.page);
});

Then('User should fill all the required details to create project', { timeout: 20000 }, async function () {
    await waitUntilpageload(this.page);

    // await this.page.reload();
    // await waitUntilPageIsReady(this.page);

    await handleGenericForm(this.page, project_testData.projectForm_stepper1);
    // await waitUntilPageIsReady(this.page);

    await handleGenericForm(this.page, project_testData.projectForm_stepper2);
    await handleGenericForm(this.page, project_testData.projectForm_stepper3);
    // await waitUntilPageIsReady(this.page);
    await handleGenericForm(this.page, project_testData.projectForm_stepper4);
    // await waitUntilPageIsReady(this.page);
    await handleGenericForm(this.page, project_testData.projectForm_stepper5);
    await waitUntilpagenetworkidle(this.page);
}
);
Then('User should click on three dot menu and choose Delete action', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await threeDotActionMenu(this.page, project_testData.menuAction_Project);
});
Then('User should see able to delete the Project successfully', { timeout: 20000 }, async function () {
    await waitUntilPageIsReady(this.page);
    await handlePopupSimple(this.page, project_testData.deleteProjectItem);
});

