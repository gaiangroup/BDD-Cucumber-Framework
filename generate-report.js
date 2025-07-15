const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './reports',
  reportPath: './reports/html',
  metadata:{
    browser: {
        name: 'chromium',
        version: 'latest'
    },
    device: 'Local test machine',
    platform: {
        name: 'Ubuntu',
        version: '20.04'
    }
  }
});
