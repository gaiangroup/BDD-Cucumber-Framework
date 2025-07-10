const { Then, Before, After, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { handleGenericForm, switchToTabOrModule,scrollContainerById, clickButton,threeDotActionMenu, handlePopupSimple, waitUntilPageIsReady, performKeyboardActions, sendAndValidateInvites, validateTableHeadersAndRow } = require('../utils/commonFunctions');
const infra_json = require('../testData/infra.json');
const tableData = require('../testData/tableData.json');

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
