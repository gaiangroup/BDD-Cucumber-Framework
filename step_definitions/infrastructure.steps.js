const { Then, Before, After, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { handleGenericForm, switchToTabOrModule,scrollContainerById, clickButton,threeDotActionMenu, handlePopupSimple, waitUntilPageIsReady, performKeyboardActions, sendAndValidateInvites,applyFiltersAndValidateResults, validateTableHeadersAndRow ,waitUntilpagedomcontentloaded} = require('../utils/commonFunctions');
const infra_json = require('../testData/infra.json');
const tableData = require('../testData/tableData.json');
const config = require('../testData/filter.json');

const fs = require('fs');
const path = require('path');

Then(
  'User clicks on {string} tab and validates the table infra',
  { timeout: 60000 },
  async function (tabName) {
    await this.page.reload();
    const tabIndex = infra_json.tabs.findIndex(
      tab => tab.label === tabName || tab.name === tabName
    );

    if (tabIndex === -1) {
      throw new Error(`Tab "${tabName}" not found in infra_json.tabs`);
    }

    await switchToTabOrModule(this.page, infra_json.tabs[tabIndex]);

    // ✅ Use tableData, which is correctly imported above
    const tableInfo = tableData[tabName];

    if (!tableInfo) {
      throw new Error(`No test data found for table: "${tabName}"`);
    }

    await validateTableHeadersAndRow(this.page, tableInfo.expectedHeaders, tableInfo.expectedRow);
  }
);

Then(
  'User switches to My Infra tab', { timeout: 20000 }, async function () {
    await waitUntilpagedomcontentloaded(this.page);
    await switchToTabOrModule(this.page, infra_json.tabs[0]);
});

Then(
  'User apply filters for {string} and verify results of Infra Structure',
  { timeout: 60 * 1000 },                // ← give this step up to 60 s
  async function (tableKey) {
    const cfg = config[tableKey];
    if (!cfg) throw new Error(`No filter config for "${tableKey}"`);
    await applyFiltersAndValidateResults(this.page, cfg);
  }
);