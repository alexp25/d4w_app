angular.module('app').controller('controlCtrl', ['$scope', 'socket', '$timeout', '$http',
  function($scope, socket, $timeout, $http) {

    $scope.timer = [];
    $scope.viewMode = 'map';
    $scope.selected = {
      reqtype: 'control'
    };

    $scope.control = {
      pump: 0,
      controller_selection: 0,
      controller_selection_id: 1
    };

    $scope.test = function() {
      console.log("test");
    };


    var startPolling = function(delay) {
      $scope.timer[1] = $timeout(function() {
        if (socket.isConnected || true) {
          socket.emit('get_data', $scope.selected);
          // socket.emit('get_data', $scope.selected, function(data) {
          //   startPollingWs_socketio();
          // });
          startPolling(delay);
        }
      }, delay);
    };

    $scope.send = function(data) {
      socket.emit('post_data', data);
      console.log(data);
    };

    $scope.downloadServerLog = function(url) {
      var config = {
        method: 'GET',
        url: url
      };
      $http(config).

      success(function(res) {
          //console.log(res);
          var blob = new Blob([res], {
            type: 'text/plain'
          });
          var url = (window.URL || window.webkitURL).createObjectURL(blob);
          var downloadLink = angular.element('<a></a>');
          downloadLink.attr('href', url);
          downloadLink.attr('download', 'log.csv');
          downloadLink[0].click();
        })
        .error(function(res) {

        });
    };


    $scope.init = function() {
      $scope.timer[0] = $timeout(function() {

        socket.connect();
        socket.on('connect', function() {
          console.log('connect event');
          socket.emit('message', 'connection');
        });

        socket.on('disconnect', function() {
          console.log('disconnect event');
        });

        socket.on('get_data', function(msg) {
          $scope.jsondata = angular.fromJson(msg);
          if ($scope.jsondata.info.mode >= 1) {
            $scope.control.pump = $scope.jsondata.info.pump;
          }
          if ($scope.jsondata.info.mode === 5) {
            $scope.control.ref = $scope.jsondata.info.ref;
          }
        });
        startPolling(100);

      }, 1000);
    };


    var clearTimers = function() {
      for (var i = 0; i < $scope.timer.length; i++) {
        $timeout.cancel($scope.timer[i]);
      }
    };

    $scope.$on("$destroy", function() {
      clearTimers();
      console.log('disconnect');
      socket.emit('disconnect_request', '');
    });
  }
]);
