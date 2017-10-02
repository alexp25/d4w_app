// angular.module('app').config(['esri.map']);
angular.module('app').config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', '$mdThemingProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $mdThemingProvider) {
    $httpProvider.defaults.withCredentials = true;
    $urlRouterProvider.otherwise(function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("home");
    });
    // $mdThemingProvider.theme('altTheme')
    //   .primaryPalette('teal') // specify primary color, all
    //   // other color intentions will be inherited
    //   // from default
    //   .accentPalette('green')
    //
    //
    //   .backgroundPalette('grey', {
    //     'default': '50' // use shade 200 for default, and keep all other shades the same
    //   });


    // $mdThemingProvider.setDefaultTheme('teal');
    $mdThemingProvider
      .theme('default')
      .primaryPalette('blue')
      .accentPalette('teal')
      .warnPalette('red')
      .backgroundPalette('grey');
    // https://material.angularjs.org/1.1.0/demo/colors

    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        access: {
          restricted: false
        },
        views: {
          /*'header': {
            templateUrl: 'static/templates/header.html'
          }*/
        }
      })

      .state('login', {
        url: '/login',
        access: {
          restricted: false
        },
        views: {
          /*'header': {
              templateUrl: 'static/templates/header.html'
            },*/
          'content': {
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
          }
        }
      })
      .state('register', {
        url: '/register',
        access: {
          restricted: false
        },
        views: {
          /*'header': {
              templateUrl: 'static/templates/header.html'
            },*/
          'content': {
            templateUrl: 'templates/register.html',
            controller: 'registerCtrl'
          }
        }
      })

      .state('home', {
        url: '/home',
        access: {
          restricted: true
        },
        views: {
          /*  'header': {
              templateUrl: 'static/templates/header.html'
            },
            'navigation': {
              templateUrl: 'static/templates/navigation.html',
              controller: 'navigationCtrl'
            },*/
          'content': {
            templateUrl: 'templates/home.html',
            controller: 'homeCtrl'
          }
        }
      })


      .state('settings', {
        url: '/settings',
        access: {
          restricted: true
        },
        views: {

          'content': {
            templateUrl: 'templates/settings.html',
            controller: 'settingsCtrl'
          }
        }
      })

      .state('overview', {
        url: '/overview',
        access: {
          restricted: true
        },
        views: {
          'content': {
            templateUrl: 'templates/overview.html',
            controller: 'overviewCtrl'
          }
        }
      })

      .state('detail-view', {
        url: '/detail-view',
        access: {
          restricted: true
        },
        views: {
          'content': {
            templateUrl: 'templates/detail-view.html',
            controller: 'detailViewCtrl'
          }
        }
      })
      .state('control', {
        url: '/control',
        access: {
          restricted: true
        },
        views: {
          'content': {
            templateUrl: 'templates/control.html',
            controller: 'controlCtrl'
          }
        }
      });
  }
]);
