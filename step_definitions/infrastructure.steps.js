const { Then, Before, After, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { handleGenericForm, switchToTabOrModule,scrollContainerById, clickButton,threeDotActionMenu, handlePopupSimple, waitUntilPageIsReady, performKeyboardActions, sendAndValidateInvites,applyFiltersAndValidateResults, validateTableHeadersAndRow ,waitUntilpagedomcontentloaded,interceptAndValidateApi} = require('../utils/commonFunctions');
const infra_json = require('../testData/infra.json');
const tableData = require('../testData/tableData.json');
const config = require('../testData/filter.json');
const apiTestData = require('../testData/apisData.json');

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
// Step for applying filters and verifying results
// Then(
//   'User apply filters for {string} and verify results of Infra Structure',
//   { timeout: 60 * 1000 },
//   async function (filterName) {
//     const filterConfig = apiTestData[filterName];
//     if (!filterConfig) throw new Error(`No filter config for "${filterName}"`);

//     // 1. First apply the filters (UI action)
//     await applyFiltersAndValidateResults(this.page, filterConfig);

//     // 2. THEN set up API interception for the EXPECTED call
//     const apiPromise = interceptAndValidateApi(this.page, filterConfig);

//     // 3. Trigger the API call by submitting/confirming filters
//     await this.page.locator('button:has-text("Apply"), [data-testid="apply-filters"]').click();

//     // 4. Now wait for the API call
//     const intercepted = await apiPromise;
    
//     if (intercepted.statusCode && intercepted.statusCode !== 200) {
//       throw new Error(`❌ Expected HTTP status 200 but got ${intercepted.statusCode}`);
//     }
    
//     console.log(`✅ Successfully applied and validated filters for: ${filterName}`);
//   }
// );
// // Step for validating API calls
Then(
  'validate API {string} is called with correct request and response for Infra Structure',
  { timeout: 20000 },
  async function (apiName) {
    const config = apiTestData[apiName];
    if (!config) throw new Error(`❌ API config not found for: ${apiName}`);
    
    // Create a promise for the API interception BEFORE triggering the action
    const apiPromise = interceptAndValidateApi(this.page, config);
    
    // Now wait for the API interception
    const intercepted = await apiPromise;

    // Optional HTTP status code check
    if (intercepted.statusCode && intercepted.statusCode !== 200) {
      throw new Error(`❌ Expected HTTP status 200 but got ${intercepted.statusCode}`);
    }

    console.log(`✅ Successfully validated API: ${apiName}`);
  }
);

