const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './reports',
  reportPath: './reports/html',
  reportName: 'RunRun UI Automation Report',
  displayDuration: true,
  metadata: {
    browser: {
      name: 'chromium',
      version: 'latest'
    },
    device: 'Local test machine',
    platform: {
      name: 'Ubuntu',
      version: '20.04'
    }
  },
  // This tells it where screenshots are stored
  screenshotsDirectory: './reports/screenshots/',
  // Optionally automatically open report after generation
  openReportInBrowser: true
});
