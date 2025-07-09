const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// *************** CONFIGURATION *****************

const defaultTag = '@table_validations';
const defaultFeatureDir = 'features';
const reportJsonPath = path.join(__dirname, '..', 'reports', 'cucumber_report.json');


const defaultOptions = [
  '--require', 'step_definitions/**/*.js',
  '--format', `json:${reportJsonPath}`,
  '--format', 'progress'
];

// *************** CLEAN PREVIOUS REPORT *****************

if (fs.existsSync(reportJsonPath)) {
  console.log('Cleaning up previous cucumber_report.json...');
  fs.unlinkSync(reportJsonPath);
}

// *************** GET ARGUMENTS *****************

const args = process.argv.slice(2);

let tagArg = args[0] || defaultTag;
let featureArg = args[1] || defaultFeatureDir;

// *************** SPAWN CUCUMBER *****************

const cucumberArgs = [
  featureArg,
  '--tags', tagArg,
  ...defaultOptions
];

console.log(`Running Cucumber with:
  Feature(s): ${featureArg}
  Tag: ${tagArg}
`);

const cucumber = spawn('npx', ['cucumber-js', ...cucumberArgs], { stdio: 'inherit' });

cucumber.on('close', (code) => {
  console.log(`Cucumber finished with exit code ${code}`);
  process.exit(code);
});
