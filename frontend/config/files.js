/* Exports a function which returns an object that overrides the default &
 *   plugin file patterns (used widely through the app configuration)
 *
 * To see the default definitions for Lineman's file paths and globs, see:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/files.coffee
 */
module.exports = function(lineman) {
  //Override file patterns here
  return {

    js: {
      vendor: [
        'vendor/bower_components/jquery/dist/jquery.js',
        'vendor/bower_components/angular/angular.js',
        'vendor/bower_components/angular-ui/build/angular-ui.js',
        'vendor/bower_components/angular-animate/angular-animate.js',
        'vendor/bower_components/angular-aria/angular-aria.js',
        'vendor/bower_components/angular-material/angular-material.js',
        'vendor/bower_components/angular-ui-router/release/angular-ui-router.js',

        'vendor/bower_components/socket.io-client/socket.io.js',

        // 'vendor/bower_components/angularjs-slider/dist/rzslider.js',

        // c3 charts
        'vendor/bower_components/d3/d3.js',
        'vendor/bower_components/c3/c3.js',

        // dropzone
        // dropzone
        'vendor/bower_components/dropzone/dist/dropzone.js',
        'vendor/bower_components/ng-dropzone/dist/ng-dropzone.js',

        // 'vendor/bower_components/c3-angular/c3-angular.js',


        'vendor/bower_components/jquery-ui/jquery-ui.js'
        // 'vendor/bower_components/angular-7seg/ut-7seg.js',
      ],
      app: [
        "app/js/appModules.js",
        "app/js/appConfig.js",
        //"app/js/*.js",
        "app/js/controllers/*.js",
        "app/js/controllers/**/*.js",
        "app/js/directives/*.js",
        "app/js/services/*.js",
        "app/js/filters/*.js"
      ]
    },

    css: {

      vendor: [
        'vendor/bower_components/angular-material/angular-material.css',
        'vendor/bower_components/font-awesome/css/font-awesome.css',
        'vendor/bower_components/jquery-ui/themes/base/jquery-ui.css',
        'vendor/bower_components/angular-7seg/ut-7seg.css',

        // dropzone
        'vendor/bower_components/dropzone/dist/dropzone.css',
        'vendor/bower_components/ng-dropzone/dist/ng-dropzone.css',

        "vendor/bower_components/c3/c3.css",
        // 'vendor/bower_components/angularjs-slider/dist/rzslider.css'
      ],
      app: [
        "app/css/*.css"
      ]
    }
  };
};
