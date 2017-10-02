/* Exports a function which returns an object that overrides the default &
 *   plugin grunt configuration object.
 *
 * You can familiarize yourself with Lineman's defaults by checking out:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/application.coffee
 *   - https://github.com/linemanjs/lineman/blob/master/config/plugins
 *
 * You can also ask Lineman's about config from the command line:
 *
 *   $ lineman config #=> to print the entire config
 *   $ lineman config concat.js #=> to see the JS config for the concat task.
 */
module.exports = function(lineman) {
  //Override application configuration here. Common examples follow in the comments.
  var app = lineman.config.application; ////1) PUT THIS HERE
  return {
    // grunt-angular-templates assumes your module is named "app", but
    // you can override it like so:
    //

    livereload: true,

    ngtemplates: {
      options: {
        module: "app"
      }
    },

    jshint: {
      options: {
        newcap: false,
        reporterOutput: ""
      }
    },


    server: {
      pushState: true,
      web: {
        port: 8001
      },

      // API Proxying
      //
      // During development, you'll likely want to make XHR (AJAX) requests to an API on the same
      // port as your lineman development server. By enabling the API proxy and setting the port, all
      // requests for paths that don't match a static asset in ./generated will be forwarded to
      // whatever service might be running on the specified port.
      //
      apiProxy: {
        enabled: true,
        host: 'localhost',
        port: 8086,
        prefix: 'api'
      }
    },


    removeTasks: {
      common: ["coffee", "handlebars", "less", "tasks", "jst"]
    },


    // added

    copy: {
      dev: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app/templates',
          src: '**',
          dest: 'generated/templates'
        }, {
          expand: true,
          dot: true,
          cwd: 'app/fonts',
          src: '**',
          dest: 'generated/fonts'
        }, {
          expand: true,
          dot: true,
          cwd: 'app/libs',
          src: '**',
          dest: 'generated/libs'
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app/templates',
          src: '**',
          dest: 'dist/templates'
        }, {
          expand: true,
          dot: true,
          cwd: 'app/fonts',
          src: '**',
          dest: 'dist/fonts'
        }, {
          expand: true,
          dot: true,
          cwd: 'app/libs',
          src: '**',
          dest: 'dist/libs'
        }]
      }
    },



    watch: {
      target: {
        "files": ["app/**/*", "spec/**/*", 'spec-e2e/**/*'],
        "tasks": 'copy:dev'
      }
    },

    // appendTasks: {
    //   common: "copy:dev",
    //   common: app.appendTasks.common.concat("myTask"),
    //   dist: "copy:dist"
    // }




  };
};
