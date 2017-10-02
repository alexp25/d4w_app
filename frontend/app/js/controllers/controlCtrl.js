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

    // $scope.sliderOnChange = function(sliderId, modelValue, highValue, pointerType) {
    //   $scope.send({
    //     'reqtype': 'control',
    //     'pump': modelValue
    //   });
    // };


    $scope.$watch('control.controller_selection', function() {
      console.log($scope.control.controller_selection);

      $scope.send({
        'reqtype': 'control',
        'controller': $scope.control.controller_selection
      });

    });



    $("#slider1").slider({
      min: 0,
      max: 255,
      slide: function(event, ui) {
        $scope.$apply(function() {
          $scope.control.pump = ui.value;
          $scope.send({
            'reqtype': 'control',
            'pump': ui.value
          });
        });
      }
    });


    $("#slider2").slider({
      min: 0,
      max: 700,
      slide: function(event, ui) {
        $scope.$apply(function() {
          $scope.control.ref = ui.value;
          $scope.send({
            'reqtype': 'control',
            'ref': ui.value
          });
        });
      }
    });

    $("#slider3").slider({
      min: 0,
      max: 700
    });


    $scope.setValue = function(slider, value) {
      // Setter
      if (slider === 1) {
        $("#slider1").slider("option", "value", value);
        if (($scope.jsondata.info.mode === undefined) || ($scope.jsondata.info.mode === 0)) {
          $scope.send({
            'reqtype': 'control',
            'pump': value
          });
        }
      } else if (slider === 2) {
        $("#slider2").slider("option", "value", value);
        if (($scope.jsondata.info.mode === undefined) || ($scope.jsondata.info.mode === 0)) {
          $scope.send({
            'reqtype': 'control',
            'ref': value
          });
        }
      } else if (slider === 3) {
        $("#slider3").slider("option", "value", value);

      }
    };

    var startPollingWs_socketio = function() {
      $scope.timer[1] = $timeout(function() {
        socket.emit('get_data', $scope.selected, function(data) {
          startPollingWs_socketio();
        });
      }, 0);
    };
    
    $scope.send = function(data) {
      socket.emit('post_data', data);
      console.log(data);
    };

    var initSocket = function() {
      socket.connect();
      socket.on('get_data', function(data) {
        $scope.jsondata = angular.fromJson(data);

        // if ($scope.control.controller_selection === undefined) {
        //   if ($scope.jsondata.controllers !== undefined) {
        //     $scope.control.controller_selection = $scope.jsondata.controllers[0];
        //   }
        // }

        if ($scope.jsondata.info.mode >= 1) {
          $scope.control.pump = $scope.jsondata.info.pump;
          $scope.setValue(1, $scope.jsondata.info.pump);
        }
        if ($scope.jsondata.info.mode === 5) {
          $scope.control.ref = $scope.jsondata.info.ref;
          $scope.setValue(2, $scope.jsondata.info.ref);
        }

        $scope.setValue(3, $scope.jsondata.info.yk);
      });
      startPollingWs_socketio();
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
