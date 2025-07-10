const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multipleReport = require('multiple-cucumber-html-reporter');
const singleReport = require('cucumber-html-reporter');

// *************** CONFIGURATION *****************
const defaultTag = '@table_validations';
const defaultFeatureDir = 'features';

// ========== TIMESTAMP SETUP ==========
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
let hours = now.getHours();
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12 || 12; // Convert 0 to 12 for 12AM
const timestamp = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}_${ampm}`;

// ========== REPORT PATHS ==========
const reportsDir = path.join(__dirname, '..', 'reports');
const reportJsonPath = path.join(reportsDir, `test_results_${timestamp}.json`);
const detailedHtmlReportPath = path.join(reportsDir, `Detailed_Test_Report_${timestamp}`);
const summaryHtmlReportPath = path.join(reportsDir, `Test_Summary_Report_${timestamp}.html`);
const latestJsonDir = path.join(reportsDir, 'latest-json');

// ========== CUCUMBER CLI OPTIONS ==========
const defaultOptions = [
  '--require', 'step_definitions/**/*.js',
  '--format', `json:${reportJsonPath}`,
  '--format', 'progress'
];

// ========== GET CLI ARGUMENTS ==========
const args = process.argv.slice(2);
const tagArg = args[0] || defaultTag;
const featureArg = args[1] || defaultFeatureDir;

console.log(`Running Cucumber with:
  Feature(s): ${featureArg}
  Tag: ${tagArg}
`);

const cucumber = spawn('npx', ['cucumber-js', featureArg, '--tags', tagArg, ...defaultOptions], {
  stdio: 'inherit'
});

cucumber.on('close', (code) => {
  console.log(`Cucumber finished with exit code ${code}`);

  // Wait briefly to ensure JSON is fully written
  setTimeout(() => {
    if (!fs.existsSync(reportJsonPath)) {
      console.error(`JSON report not found: ${reportJsonPath}`);
      process.exit(1);
    }

    // Prepare latest-json folder for current run
    if (!fs.existsSync(latestJsonDir)) {
      fs.mkdirSync(latestJsonDir, { recursive: true });
    } else {
      fs.readdirSync(latestJsonDir).forEach(file => {
        fs.unlinkSync(path.join(latestJsonDir, file));
      });
    }

    // Copy current JSON to latest-json/
    const latestJsonPath = path.join(latestJsonDir, path.basename(reportJsonPath));
    fs.copyFileSync(reportJsonPath, latestJsonPath);
    console.log(`Copied JSON to latest-json folder: ${latestJsonPath}`);

    // Generate Detailed (Multiple Cucumber) HTML Report
    multipleReport.generate({
      jsonDir: latestJsonDir,
      reportPath: detailedHtmlReportPath,
      reportName: `RunRun Detailed Test Report - ${timestamp}`,
      metadata: {
        browser: {
          name: 'chrome',
          version: 'latest'
        },
        device: 'Local test machine',
        platform: {
          name: process.platform,
          version: process.version
        }
      }
    });
    console.log(`Detailed HTML report generated at: ${detailedHtmlReportPath}`);

    //Generate Summary (Single Cucumber HTML) Report
    singleReport.generate({
      theme: 'bootstrap',
      jsonFile: reportJsonPath,
      output: summaryHtmlReportPath,
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        "Platform": "Ubuntu 20.04",
        "Browser": "Chromium latest",
        "Device": "Local test machine"
      }
    });
    console.log(`Test Summary HTML report generated at: ${summaryHtmlReportPath}`);

    process.exit(code);
  }, 500);
});
