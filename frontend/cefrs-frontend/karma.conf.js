module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    files: [
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/zone-testing.js'
    ],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],

    client: {
      jasmine: {
        // jasmine options here
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },

    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated results message
    },

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/facility-reservation-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },

    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false, // Set to false for CI

    // CI/HEADLESS CONFIGURATION
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox', // CRITICAL for CI environments
          '--headless',
          '--disable-gpu',
          '--remote-debugging-port=9222'
        ]
      }
    },
    singleRun: true, // MUST be true for CI builds
    restartOnFileChange: false
  });
};
