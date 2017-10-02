angular.module('app').controller('detailViewCtrl', ['$scope', 'socket', '$timeout', '$http',
  function($scope, socket, $timeout, $http) {

    $scope.timer = [];
    $scope.viewMode = 'map';
    $scope.selected = {
      reqtype: 'sensors',
      type: 100,
      id: 0
    };

    var startPollingWs_socketio = function() {
      $scope.timer[1] = $timeout(function() {
        // socket.emit('get_data', {
        //   message: ''
        // }, function(data) {
        //   startPollingWs_socketio();
        // });

        socket.emit('get_data', $scope.selected, function(data) {
          startPollingWs_socketio();
        });
      }, 0);
    };

    $scope.uiTable = false;

    $scope.list = [{
        id: 1,
        value: 10
      },
      {
        id: 2,
        value: 10
      }
    ];
    $scope.config1 = {
      itemsPerPage: 10,
      fillLastPage: true
    };
    $scope.config2 = {
      itemsPerPage: 5,
      fillLastPage: true
    };


    // MAP
    console.log("ctrl");
    $scope.mapViewOptions = {
      zoom: 15,
      center: [26.036, 44.492]
    };

    var initSocket = function() {
      socket.connect();
      socket.on('get_data', function(data) {
        $scope.jsondata = angular.fromJson(data);
      });
      startPollingWs_socketio();
    };






    $scope.init = function() {
      $scope.timer[0] = $timeout(function() {
        initSocket();
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
