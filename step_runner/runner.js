const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const multipleReport = require('multiple-cucumber-html-reporter');
const singleReport = require('cucumber-html-reporter');

// *************** CONFIGURATION *****************
const defaultTag = '@suite_1';
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
hours = hours % 12 || 12;
const timestamp = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}_${ampm}`;

// ========== REPORT PATHS ==========
const reportsDir = path.join(__dirname, '..', 'reports');
const jsonDir = path.join(reportsDir, 'json_reports');
const htmlSummaryDir = path.join(reportsDir, 'html_reports');
const multiCucumberDir = path.join(reportsDir, 'cucumber_reports');
const latestJsonDir = path.join(reportsDir, 'latest-json');
const zipDir = path.join(reportsDir, 'zip');

// ========== Ensure output directories exist ==========
[jsonDir, htmlSummaryDir, multiCucumberDir, latestJsonDir, zipDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ========== Dynamic Report File Paths ==========
const reportJsonPath = path.join(jsonDir, `json_report_${timestamp}.json`);
const summaryHtmlReportPath = path.join(htmlSummaryDir, `single_html_${timestamp}.html`);
const detailedHtmlReportPath = path.join(multiCucumberDir, `cucumber_report_${timestamp}`);

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
  console.log(`\nCucumber finished with exit code ${code}`);

  setTimeout(() => {
    if (!fs.existsSync(reportJsonPath)) {
      console.error(`JSON report not found: ${reportJsonPath}`);
      process.exit(1);
    }

    // Clear and update latest-json folder
    fs.readdirSync(latestJsonDir).forEach(file => {
      fs.unlinkSync(path.join(latestJsonDir, file));
    });

    const latestJsonPath = path.join(latestJsonDir, path.basename(reportJsonPath));
    fs.copyFileSync(reportJsonPath, latestJsonPath);
    console.log(`Copied JSON to latest-json folder: ${latestJsonPath}`);

    // Generate Multiple Cucumber HTML Report
    multipleReport.generate({
      jsonDir: latestJsonDir,
      reportPath: detailedHtmlReportPath,
      reportName: `RunRun Detailed Test Report - ${timestamp}`,
      metadata: {
        browser: { name: 'chrome', version: 'latest' },
        device: 'Local test machine',
        platform: { name: process.platform, version: process.version }
      }
    });
    console.log(`Detailed HTML report generated at: ${detailedHtmlReportPath}`);

    // Generate Summary Report
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

    // ===== ZIP THE MULTI-CUCUMBER REPORT FOLDER =====
    const folderToZip = detailedHtmlReportPath;
    const zipFileName = `cucumber_report_${timestamp}.zip`;
    const zipFilePath = path.join(zipDir, zipFileName);

    console.log(`Zipping from: ${folderToZip}`);
    console.log(`Saving zip to: ${zipFilePath}`);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Zipped successfully! File saved at: ${zipFilePath}, Size: ${archive.pointer()} bytes`);
      //Exit only after zip is done
      process.exit(code);
    });

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      throw err;
    });

    archive.pipe(output);
    archive.directory(folderToZip, false); // false: zip contents only
    archive.finalize(); // Starts the zipping
  }, 500);
});

