angular.module('app').controller('settingsCtrl', ['$scope', '$timeout',
  '$log', '$http',
  function($scope, $timeout, $log, $http) {
    $scope.settings = {};
    $scope.hasData = true;


    $scope.postSettings = function() {
      console.log($scope.settings.data);
    };

    $scope.getSettings = function() {
      $scope.hasData = false;
    };

    $scope.reloadConfig = function() {
      console.log("reload server config");
      var config = {
        method: 'GET',
        url: 'api/reload'
      };
      $http(config).

      success(function(res) {

        })
        .error(function(res) {

        });
    };

    var setData = function(data, model, settings) {
      var i, j;

      // set default values from model
      for (i = 0; i < model.app.length; i++) {
        data[model.app[i].name] = model.app[i].default;
      }
      // update with actual values from the database
      angular.forEach(settings, function(value, key) {
        // this.push(key + ': ' + value);
        if (data[key] !== undefined) {
          data[key] = value;
        }
      });
      return data;
    };

    $scope.init = function() {
      //$scope.getSettings();
    };

    $scope.$on('$destroy', function(event) {});
  }
]);
