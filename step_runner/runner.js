const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const defaultTag = '@expandCollapse';

const defaultFeatureDir = 'features';
const reportJsonPath = path.join(__dirname, '..', 'reports', 'cucumber_report.json');

const defaultOptions = [
  '--require', 'step_definitions/**/*.js',
  '--format', `"json:${reportJsonPath.replace(/\\/g, '/')}"` ,
  '--format', 'progress'
];

if (fs.existsSync(reportJsonPath)) {
  console.log('🧹 Cleaning up previous cucumber_report.json...');
  fs.unlinkSync(reportJsonPath);
}

const args = process.argv.slice(2);
const tagArg = args[0] || defaultTag;
const featureArg = args[1] || defaultFeatureDir;

const cucumberArgs = [
  'exec',
  'cucumber-js',
  '--',
  featureArg,
  '--tags',
  tagArg,
  ...defaultOptions
];

const npmCmdQuoted = `"C:\\Program Files\\nodejs\\npm.cmd"`;

console.log(`🚀 Running Cucumber:
  Features: ${featureArg}
  Tag: ${tagArg}
  npm: ${npmCmdQuoted}
`);

try {
  const cucumber = spawn(npmCmdQuoted, cucumberArgs, {
    shell: true,
    stdio: 'inherit',
  });

  cucumber.on('error', (err) => {
    console.error('❌ Failed to start process:', err.message);
    console.error(err);
  });

  cucumber.on('close', (code) => {
    console.log(`✅ Cucumber finished with exit code ${code}`);
    process.exit(code);
  });
} catch (err) {
  console.error('❌ Unexpected error:', err.message);
}
