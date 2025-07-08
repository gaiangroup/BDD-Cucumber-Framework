const { Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { verifyTooltip } = require('../utils/commonFunctions.js');
const tooltipConfig = require('../testData/tooltipConfig.json');

setDefaultTimeout(60 * 1000); // Optional: increase timeout for tooltip step

Then('Tooltip should be validated for {string}', async function (elementKey) {
  const config = tooltipConfig[elementKey];

  if (!config) {
    throw new Error(` No tooltip config found for key: "${elementKey}"`);
  }

  console.log(` Running tooltip validation for key: "${elementKey}"`);
  console.log(` Target Text: "${config.targetText}" | Expected Tooltip: "${config.expectedText}"`);

  await verifyTooltip(this.page, config);
});
