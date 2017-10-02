angular.module('app').directive('infoList', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/directives/info-list.html',
    scope: {
      caption: '@',
      items: '='
    },
    link: function(scope) {

    }

  };
});
