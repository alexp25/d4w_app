angular.module('app').directive('raspiContainer', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: false,
    templateUrl: 'templates/directives/raspi-container.html',
    scope: {
      caption: '@'
    },
    link: function(scope) {

    }
  };
});
