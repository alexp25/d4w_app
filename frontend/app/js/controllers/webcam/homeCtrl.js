angular.module('app').controller('webcamHomeCtrl', ['SharedProperties', '$scope', '$log',
  '$timeout', '$interval',
  '$filter', '$http', '$rootScope',
  function(SharedProperties, $scope, $log, $timeout, $interval, $filter, $http, $rootScope) {
    $scope.isFullscreen = false;
    $scope.enableStream = false;


    $scope.goFullscreen = function(id) {
      //console.log('go fullscreen');
      // Get the element that we want to take into fullscreen mode
      var element = document.getElementById(id);
      // These function will not exist in the browsers that don't support fullscreen mode yet,
      // so we'll have to check to see if they're available before calling them.
      if (element.mozRequestFullScreen) {
        // This is how to go into fullscren mode in Firefox
        // Note the "moz" prefix, which is short for Mozilla.
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        // This is how to go into fullscreen mode in Chrome and Safari
        // Both of those browsers are based on the Webkit project, hence the same prefix.
        element.webkitRequestFullScreen();
      }
      // Hooray, now we're in fullscreen mode!
    };

    $scope.quitFullscreen = function() {
      //console.log('go fullscreen');
      // Get the element that we want to take into fullscreen mode
      var element = document;
      // These function will not exist in the browsers that don't support fullscreen mode yet,
      // so we'll have to check to see if they're available before calling them.
      if (element.cancelFullScreen) {
        // This is how to go into fullscren mode in Firefox
        // Note the "moz" prefix, which is short for Mozilla.
        element.cancelFullScreen();
      } else if (element.mozCancelFullScreen) {
        // This is how to go into fullscren mode in Firefox
        // Note the "moz" prefix, which is short for Mozilla.
        element.mozCancelFullScreen();
      } else if (element.webkitCancelFullScreen) {
        // This is how to go into fullscreen mode in Chrome and Safari
        // Both of those browsers are based on the Webkit project, hence the same prefix.
        element.webkitCancelFullScreen();
      }
      // Hooray, now we're in fullscreen mode!
    };

    $scope.toggleFullscreen = function() {
      var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
      //console.log('toggles: ',state);
      if (state === true) {
        $scope.quitFullscreen();
      } else {
        $scope.goFullscreen('player');
      }
    };

    $scope.toggleStream = function() {
      if ($scope.enableStream === true) {
        $timeout(function() {
          $scope.enableStream = false;
          $scope.playIcon = "fa fa-play fa-2x";
        }, 500);
      } else {
        $scope.enableStream = true;
        $scope.playIcon = "fa fa-stop fa-2x";
      }
    };

    $scope.refreshStream = function() {
      $scope.enableStream = false;
      $scope.playIcon = "fa fa-play fa-2x";
      $timeout(function() {
        $scope.enableStream = true;
        $scope.playIcon = "fa fa-stop fa-2x";
      }, 500);
    };


    $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
      var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
      var event = state ? 'FullscreenOn' : 'FullscreenOff';
      //console.log('full screen change event: ', state);
      $scope.$apply(function() {
        $scope.isFullscreen = state;
        if ($scope.isFullscreen) {
          $scope.fullContentWidth = undefined;
        } else {
          $scope.fullContentWidth = ($scope.fullContentHeight) * 4 / 3;
        }
        $scope.enableStream = false;
        $timeout(function() {
          $scope.enableStream = true;
          $scope.playIcon = 'fa fa-stop fa-2x';
        });
      });
    });

    $scope.init = function() {
      var props = SharedProperties.getProperty();
      $scope.mjpegStream = props.documentSettings.mjpegStream;
      $scope.stream = {
        url: props.url + '/api/video-feed',
        routes: [{
          'name': 'video',
          'url': props.url + '/api/video-feed'
        }, {
          'name': 'processed video',
          'url': props.url + '/api/video-feed-processed'
        }]
      };

      $timeout(function() {
        $scope.enableStream = true;
        if ($scope.enableStream === true) {
          $scope.playIcon = 'fa fa-stop fa-2x';
        } else if ($scope.enableStream === false) {
          $scope.playIcon = 'fa fa-play fa-2x';
        }
      }, 300);

    };
    $scope.$on("$destroy", function() {
      $scope.stream.url = "#";
    });
  }
]);
