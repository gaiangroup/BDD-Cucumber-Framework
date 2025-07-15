const path = require("path");
const reporter = require("cucumber-html-reporter");

reporter.generate({
  theme: "bootstrap",
  jsonFile: path.join(__dirname, "reports", "cucumber_report.json"),
  output: path.join(__dirname, "reports", "cucumber_report_single.html"),
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "Platform": "Ubuntu 20.04",
    "Browser": "Chromium latest",
    "Device": "Local test machine"
  }
});
