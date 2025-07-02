module.exports = {
  default: [
    '--require step_definitions/**/*.js',
    '--format cucumberjs-allure2-reporter'
  ].join(' ')
};
