angular.module('app').directive('modelWatch', [function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel'
    },
    link: function($scope, $element, $attr, ngModelCtrl) {
      $scope.$watch('model', function() {
        console.log('Model has changed to ' + $scope.model);
        console.log($scope);
      });
    }
  };
}]);
