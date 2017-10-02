angular.module('app').controller('navigationCtrl', ['$scope',
  '$log', '$timeout', '$filter', '$state', '$location',
  '$rootScope', '$templateCache', '$q',
  function($scope, $log, $timeout, $filter, $state,
    $location,
    $rootScope, $templateCache, $q) {
    $scope.navstyle = 1;

    $scope.menuReady = false;
    $scope.tabSelection = {};
    $scope.fullContentHeight = 0;
    $scope.showSidenav = true;
    /*	$scope.tabSelection = {
    			lvl1: 0,
    			lvl2: 0
    	};*/
    var elementLvl1, elementLvl2;


    var isMobile = {
      Android: function() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
    };

    $scope.menuList = [{
      name: '',
      url: '#/home',
      icon: 'fa fa-home fa-2x'
    }, {
      name: 'Overview',
      url: '#/overview',
      icon: ''
    }, {
      name: 'Detail view',
      url: '#/detail-view',
      icon: ''
    },{
      name: 'Control',
      url: '#/control',
      icon: ''
    }, {
      name: 'Settings',
      url: '#/settings',
      icon: ''
    }];

    $scope.login = function() {
      $state.go('login');
    };


    var changeUrl = function(changedLvl) {
      if (changedLvl === 1) {
        //console.log('change lvl1');
        elementLvl1 = $scope.menuList[$scope.tabSelection.lvl1];
        if (elementLvl1) {
          if (elementLvl1.hasOwnProperty('url')) {
            $location.path(elementLvl1.url.replace('#', ''));
          }
        }
        //$scope.tabSelection.lvl2 = 0;
      } else if (changedLvl === 2) {
        //console.log('change lvl2');

        if (elementLvl1) {
          if (elementLvl1.hasOwnProperty('subSections')) {
            elementLvl2 = elementLvl1.subSections[$scope.tabSelection.lvl2];
            if (elementLvl2) {
              if (elementLvl2.hasOwnProperty('url')) {
                $location.path(elementLvl2.url.replace('#', ''));
              }
            }
          }
        }
      }
    };
    var selectTabsFromUrl = function(value) {
      //search through menu structure to find matching url and corresponding indexes for 2 way bindning with the tabs
      var found = false;
      value = '#' + value;
      //console.log(value);
      for (var i = 0; i < $scope.menuList.length; i++) {
        var menuSelection = $scope.menuList[i];
        if (menuSelection.hasOwnProperty('url')) {
          if (menuSelection.url === value) {
            $scope.tabSelection = {
              lvl1: i,
              lvl2: 0
            };
            break;
          }
        }
        if (menuSelection.hasOwnProperty('subSections')) {
          for (var j = 0; j < menuSelection.subSections.length; j++) {
            var subSection = menuSelection.subSections[j];
            if (subSection.hasOwnProperty('url')) {
              if (subSection.url === value) {
                $scope.tabSelection = {
                  lvl1: i,
                  lvl2: j
                };
                found = true;
                break;
              }
            }

          }
          if (found) {
            break;
          }
        }
      }
    };
    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {

        console.log('navigationCtrl stateChangeStart to:');
        console.log(toState.name);

        if (toState.name === 'home') {
          $scope.tabSelection = {
            lvl1: 0,
            lvl2: 0
          };
        }
        if (toState.restricted !== true) {
          selectTabsFromUrl($location.path());
        }
      });

    $rootScope.$on('$viewContentLoaded',
      function(event, toState, toParams, fromState, fromParams) {
        //window.scrollTo(0, 0);
        console.log("viewContentLoaded");
      });


    $scope.init = function() {
      if ($scope.navstyle === 1) {
        selectTabsFromUrl($location.path());
        $scope.$watch('tabSelection.lvl1', function() {
          changeUrl(1);
          changeUrl(2);
        });
        $scope.$watch('tabSelection.lvl2', function() {
          changeUrl(2);
        });
      }

      $scope.menuReady = true;
    };


    $scope.isSelected = function(url) {
      if ($location.path() === url.replace('#', '')) {
        return true;
      }
      return false;
    };


    /*  $(window).resize(function() {
        $scope.$apply(function() {
          console.log('resized');
          $scope.fullContentHeight = getFullHeight();
          SharedProperties.getProperty().documentSettings.fullContentHeight = $scope.fullContentHeight;
          console.log(SharedProperties.getProperty().documentSettings.fullContentHeight);
        });
      });*/
    //
    // $scope.clearCache = function() {
    //   $templateCache.removeAll();
    //   console.log('clear cache');
    // };

  }
]);
