angular.module('app').directive('raspiNumeric', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/raspi-numeric.html',
    scope: {
      caption: '@',
      items: '=',
      sx: '@'
    },
    link: function(scope) {
      if (scope.sx === undefined) {
        scope.sx = '';
      }
    }
  };
});
