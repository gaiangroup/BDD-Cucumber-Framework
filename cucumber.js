module.exports = {
  default: {
    require: [
      'utils/commonFunctions.js',
      'step_definitions/**/*.js'
    ],
    requireModule: [],
    format: ['summary']
  }
};
