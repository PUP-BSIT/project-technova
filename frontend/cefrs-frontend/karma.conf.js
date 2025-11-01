module.exports = function (config) {
  config.set({
    basePath: '',
    // Frameworks must be listed by name, not internal path
    frameworks: ['jasmine', 'karma-jasmine'],

    // Plugins must be required using the installed package names
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),

      // Load the Angular preprocessor directly using its package name
      // This is the most stable method for CI environments
      require('@angular/cli/plugins/karma')
    ],

    client: {
      jasmine: {
        //jasmine options here
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
