const { Then, Before, After, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { handleGenericForm, switchToTabOrModule,scrollContainerById, clickButton,threeDotActionMenu, handlePopupSimple, waitUntilPageIsReady, performKeyboardActions, sendAndValidateInvites, validateTableHeadersAndRow } = require('../utils/commonFunctions');
const customers = require('../testData/customer.json');
const tableData = require('../testData/tableData.json');

const fs = require('fs');
const path = require('path');
Then(
  'User clicks on {string} tab and validates the table Customers',
  { timeout: 60000 },
  async function (tabName) {
    await this.page.reload();
    const tabIndex = customers.tabs.findIndex(
      tab => tab.label === tabName || tab.name === tabName
    );

    if (tabIndex === -1) {
      throw new Error(`Tab "${tabName}" not found in customers.tabs`);
    }

    await switchToTabOrModule(this.page, customers.tabs[tabIndex]);

    // ✅ Use tableData, which is correctly imported above
    const tableInfo = tableData[tabName];

    if (!tableInfo) {
      throw new Error(`No test data found for table: "${tabName}"`);
    }

    await validateTableHeadersAndRow(this.page, tableInfo.expectedHeaders, tableInfo.expectedRow);
  }
);
