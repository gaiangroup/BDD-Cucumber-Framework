const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = path.join(__dirname, '../reports/json_reports');
const reportJsonPath = path.join(reportDir, `json_report_${timestamp}.json`);

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

if (fs.existsSync(reportJsonPath)) {
  console.log('🧹 Cleaning up previous report...');
  fs.unlinkSync(reportJsonPath);
}

const defaultTag = '@tooltip';
const defaultFeatureDir = 'features';
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
  '--format',
  `"json:${reportJsonPath}"`
];

const npmCmdQuoted = `"C:\\Program Files\\nodejs\\npm.cmd"`;

console.log(`🚀 Running Cucumber:
  Features: ${featureArg}
  Tag: ${tagArg}
  Report: ${reportJsonPath}
`);

try {
  const cucumber = spawn(npmCmdQuoted, cucumberArgs, {
    shell: true,
    stdio: 'inherit',
  });

  cucumber.on('error', (err) => {
    console.error('❌ Failed to start process:', err.message);
  });

  cucumber.on('close', (code) => {
    console.log(`✅ Cucumber finished with exit code ${code}`);
    process.exit(code);
  });
} catch (err) {
  console.error('❌ Unexpected error:', err.message);
}
