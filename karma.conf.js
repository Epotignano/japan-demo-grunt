// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './client',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-formly/dist/formly.js',
      'bower_components/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js',
      'bower_components/lodash/dist/lodash.compat.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',


      //app modules

      'app/app.js',

      'app/modules/**/**/*.js',
      'app/modules/**/*.js',

      //components JS files
      'components/**/**/**/*.js',

      // components HTML files
      'components/**/**/**/*.html',
      'components/**/**/*.html',
      'components/**/*.html',
      'components/*.html'

    ],

    preprocessors: {
      '**/*.html': 'html2js'
    },

    reporters: ['story'],

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
      moduleName: 'ui.templates'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
