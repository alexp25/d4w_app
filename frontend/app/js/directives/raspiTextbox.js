angular.module('app').directive('raspiTextbox', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/raspi-textbox.html',
    scope: {
      caption: '@',
      text: '=',
      align: '@'
    },
    link: function(scope) {}
  };
});
