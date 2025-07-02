const { spawn } = require('child_process');
const path = require('path');

// *************** CONFIGURATION *****************

// 1️.Default tag to run
const defaultTag = '@org_validations';

// 2️.Default features folder
const defaultFeatureDir = 'features';

// 3️.Additional Cucumber options
const defaultOptions = [
  '--require', 'step_definitions/**/*.js',
  '--format', 'progress',
  '--format', 'json:./reports/cucumber_report.json'
];

// *************** GET ARGUMENTS *****************

// Example usage:
// node runner.js @regression
// node runner.js @smoke features/login.feature
// node runner.js

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
